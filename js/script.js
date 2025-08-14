// ==== FIREBASE SETUP ====
// Import Firebase modules (already included via <script> in index.html)
const db = firebase.firestore();

// State
let users = [];
let shifts = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// ==== REAL-TIME LISTENERS ====

// Listen for users collection changes
db.collection("users").orderBy("createdAt").onSnapshot(snapshot => {
    users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderUsers();
    renderCalendar();
});

// Listen for shifts collection changes
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

// ==== SHIFT MANAGEMENT ====
async function addShift() {
    const input = document.getElementById('shift-text').value.trim();
    if (!input) return alert("Enter a shift description.");
    
    const parsedShifts = parseShiftInput(input); // Your existing parsing logic
    for (let shift of parsedShifts) {
        const user = users.find(u => u.name.toLowerCase() === shift.user);
        if (user) {
            await db.collection("shifts").add({
                userId: user.id,
                date: shift.date, // Format: YYYY-MM-DD or similar
                shiftType: shift.shiftType,
                start: shift.start || null,
                end: shift.end || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
    document.getElementById('shift-text').value = '';
}

async function deleteShift(shiftId) {
    await db.collection("shifts").doc(shiftId).delete();
}

// ==== CALENDAR ====
function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('month-year');
    calendarGrid.innerHTML = '';

    // Days header
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const div = document.createElement('div');
        div.className = 'day day-header';
        div.textContent = day;
        calendarGrid.appendChild(div);
    });

    // Month header
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    monthYear.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${currentYear}`;

    // Empty cells before month start
    for (let i = 0; i < startDay; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    // Days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const div = document.createElement('div');
        div.className = 'day';
        div.innerHTML = `<strong>${day}</strong>`;

        // Date string for matching
        const dateStr = `${day}.${currentMonth + 1}`;

        // Find shifts for this date
        const dayShifts = shifts.filter(s => {
            const shiftDate = new Date(s.date);
            return shiftDate.getDate() === day &&
                   shiftDate.getMonth() === currentMonth &&
                   shiftDate.getFullYear() === currentYear;
        });

        dayShifts.forEach(shift => {
            const user = users.find(u => u.id === shift.userId);
            if (user) {
                const shiftDiv = document.createElement('div');
                shiftDiv.className = 'shift';
                shiftDiv.style.backgroundColor = user.color;
                shiftDiv.innerHTML = `${user.name}: ${shift.shiftType} <button onclick="deleteShift('${shift.id}')">x</button>`;
                div.appendChild(shiftDiv);
            }
        });

        calendarGrid.appendChild(div);
    }
}

// ==== MONTH NAVIGATION ====
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}
