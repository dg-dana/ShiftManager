// ==== FIREBASE SETUP ====
// Import Firebase modules (already included via <script> in index.html)
const db = firebase.firestore();

// State
let users = [];
let shifts = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// ==== DEBUG CONSOLE ====
(function() {
  const debugEl = document.getElementById('debug-console');
  
  function printToDebug(...args) {
    const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    debugEl.innerHTML += `<div>${message}</div>`;
    debugEl.scrollTop = debugEl.scrollHeight;
  }
  
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = function(...args) {
    originalLog.apply(console, args);
    printToDebug('[LOG]', ...args);
  };
  
  console.error = function(...args) {
    originalError.apply(console, args);
    printToDebug('<span style="color:red">[ERROR]</span>', ...args);
  };
})();

// ==== REAL-TIME LISTENERS ====

// Users listener
db.collection("users").orderBy("createdAt").onSnapshot(snapshot => {
    users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderUsers();
    updateUserFilter();
    renderCalendar();
});

// Shifts listener
db.collection("shifts").onSnapshot(snapshot => {
    shifts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderCalendar();
});

// ==== USER MANAGEMENT ====
async function addUser() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter a name.");
    if (users.length >= 5) return alert("Maximum 5 users allowed.");
    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) return alert("This name already exists.");

    const colors = ['#FF6347', '#4682B4', '#FFD700', '#6A5ACD', '#FF4500'];
    const color = colors[users.length % colors.length];

    await db.collection("users").add({
        name,
        color,
        templates: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    nameInput.value = '';
}

async function removeUser(userId) {
    await db.collection("users").doc(userId).delete();

    // Also delete related shifts
    const shiftsSnapshot = await db.collection("shifts").where("userId", "==", userId).get();
    const batch = db.batch();
    shiftsSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
}

function renderUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="user-color" style="background-color: ${user.color}"></span>
            ${user.name}
            <button onclick="removeUser('${user.id}')">Delete</button>
        `;
        userList.appendChild(li);
    });
}

// ==== USER FILTER DROPDOWN ====
function updateUserFilter() {
    const filter = document.getElementById('user-filter');
    filter.innerHTML = '<option value="all">All Users</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        filter.appendChild(option);
    });
}

// ==== SHIFT MANAGEMENT ====
async function addShift() {
    const userId = document.getElementById('active-user').value.trim();
    const input = document.getElementById('shift-text').value.trim();
    const user = users.find(u => u.id === userId);

    if (!user || !input) {
        alert('Select a user and enter a shift.');
        return;
    }

    const [code, dateStr] = input.split(/\s+/);
    const template = user.templates?.find(t => t.code === code.toUpperCase());

    if (!template) {
        alert('Invalid shift code.');
        return;
    }

    const dates = parseDateRange(dateStr);
    if (!dates) {
        alert('Invalid date format. Use DD.MM or DD.MM-DD.MM');
        return;
    }

    for (let date of dates) {
        const existing = shifts.find(s => s.userId === userId && s.date === date);
        if (!existing) {
            await db.collection("shifts").add({
                userId: userId,
                date: date, // YYYY-MM-DD
                templateCode: code.toUpperCase(),
                shiftName: template.name,
                startTime: template.start || null,
                endTime: template.end || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    document.getElementById('shift-text').value = '';
}

async function deleteShift(shiftId) {
    await db.collection("shifts").doc(shiftId).delete();
}

// ==== DATE RANGE PARSER ====
function parseDateRange(dateStr) {
    const currentYear = new Date().getFullYear();
    const dateRegex = /^(\d{1,2})\.(\d{1,2})(?:-(\d{1,2})\.(\d{1,2}))?$/;
    const match = dateStr.match(dateRegex);
    if (!match) return null;

    const startDay = parseInt(match[1]);
    const startMonth = parseInt(match[2]) - 1;

    if (!match[3]) {
        return [formatDate(new Date(currentYear, startMonth, startDay))];
    }

    const endDay = parseInt(match[3]);
    const endMonth = parseInt(match[4]) - 1;
    const dates = [];
    let current = new Date(currentYear, startMonth, startDay);
    const end = new Date(currentYear, endMonth, endDay);

    while (current <= end) {
        dates.push(formatDate(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

function formatDate(date) {
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
}

// ==== EXPORT / IMPORT DATA ====
async function exportData() {
    const usersSnap = await db.collection("users").get();
    const shiftsSnap = await db.collection("shifts").get();

    const data = {
        users: usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        shifts: shiftsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shift-calendar.json';
    a.click();
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async e => {
        const data = JSON.parse(e.target.result);

        const batch = db.batch();

        const usersSnap = await db.collection("users").get();
        usersSnap.forEach(doc => batch.delete(doc.ref));

        const shiftsSnap = await db.collection("shifts").get();
        shiftsSnap.forEach(doc => batch.delete(doc.ref));

        (data.users || []).forEach(user => {
            const ref = db.collection("users").doc(user.id || undefined);
            batch.set(ref, user);
        });

        (data.shifts || []).forEach(shift => {
            const ref = db.collection("shifts").doc(shift.id || undefined);
            batch.set(ref, shift);
        });

        await batch.commit();

        alert('Data imported successfully!');
    };

    reader.readAsText(file);
}

// ==== CALENDAR RENDERING ====
function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('month-year');
    calendarGrid.innerHTML = '';

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    days.forEach(day => {
        const div = document.createElement('div');
        div.className = 'day day-header';
        div.textContent = day;
        calendarGrid.appendChild(div);
    });

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth+1, 0);
    const startDay = firstDay.getDay();
    monthYear.textContent = `${firstDay.toLocaleString('default',{month:'long'})} ${currentYear}`;

    for(let i=0;i<startDay;i++) calendarGrid.appendChild(document.createElement('div'));

    const selectedUserId = document.getElementById('user-filter')?.value || 'all';

    for(let day=1; day<=lastDay.getDate(); day++) {
        const div = document.createElement('div');
        div.className='day';
        div.innerHTML = `<strong>${day}</strong>`;

        const dayShifts = shifts.filter(s => {
            if(selectedUserId !== 'all' && s.userId !== selectedUserId) return false;
            const shiftDate = new Date(s.date);
            return shiftDate.getDate()===day &&
                   shiftDate.getMonth()===currentMonth &&
                   shiftDate.getFullYear()===currentYear;
        });

        dayShifts.forEach(shift => {
            const user = users.find(u => u.id === shift.userId);
            if(user) {
                const shiftDiv = document.createElement('div');
                shiftDiv.className='shift';
                shiftDiv.style.backgroundColor=user.color;
                shiftDiv.innerHTML=`${user.name}: ${shift.shiftName} <button onclick="deleteShift('${shift.id}')">x</button>`;
                div.appendChild(shiftDiv);
            }
        });

        calendarGrid.appendChild(div);
    }
}

// ==== MONTH NAVIGATION ====
function prevMonth() {
    currentMonth--;
    if(currentMonth<0) { currentMonth=11; currentYear--; }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if(currentMonth>11) { currentMonth=0; currentYear++; }
    renderCalendar();
}
