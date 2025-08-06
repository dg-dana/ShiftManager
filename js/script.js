// State
let users = JSON.parse(localStorage.getItem('users')) || [];
let shifts = JSON.parse(localStorage.getItem('shifts')) || [];
let currentMonth = new Date().getMonth(); // August (7) for 2025
let currentYear = new Date().getFullYear(); // 2025

// User Management
function addUser() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    if (!name || users.length >= 5 || users.find(u => u.name.toLowerCase() === name.toLowerCase())) return;

    const colors = ['#FF6347', '#4682B4', '#FFD700', '#6A5ACD', '#FF4500'];
    const user = { name, color: colors[users.length % colors.length] };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    nameInput.value = '';
    renderUsers();
}

function renderUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    users.forEach((user, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="user-color" style="background-color: ${user.color}"></span>
            ${user.name}
            <button onclick="removeUser(${index})">Delete</button>
        `;
        userList.appendChild(li);
    });
}

function removeUser(index) {
    users.splice(index, 1);
    shifts = shifts.filter(s => s.user !== users[index]?.name.toLowerCase());
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('shifts', JSON.stringify(shifts));
    renderUsers();
    renderCalendar();
}

// Shift Management
function addShift() {
    const input = document.getElementById('shift-text').value;
    const parsedShifts = parseShiftInput(input);
    shifts.push(...parsedShifts);
    localStorage.setItem('shifts', JSON.stringify(shifts));
    document.getElementById('shift-text').value = '';
    renderCalendar();
}

// Calendar Rendering
function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('month-year');
    calendarGrid.innerHTML = '';

    // Days of week header
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const div = document.createElement('div');
        div.className = 'day day-header';
        div.textContent = day;
        calendarGrid.appendChild(div);
    });

    // Current month and year
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    monthYear.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${currentYear}`;

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    // Days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const div = document.createElement('div');
        div.className = 'day';
        div.innerHTML = `<strong>${day}</strong>`;
        const dayShifts = shifts.filter(s => s.date === `${day}.${currentMonth + 1}`);
        dayShifts.forEach(shift => {
            const user = users.find(u => u.name.toLowerCase() === shift.user);
            if (user) {
                const shiftDiv = document.createElement('div');
                shiftDiv.className = 'shift';
                shiftDiv.style.backgroundColor = user.color;
                shiftDiv.innerHTML = `${shift.user}: ${shift.shiftType} <button onclick="deleteShift('${shift.date}', '${shift.user}', '${shift.shiftType}')">x</button>`;
                div.appendChild(shiftDiv);
            }
        });
        calendarGrid.appendChild(div);
    }
}

function deleteShift(date, user, shiftType) {
    shifts = shifts.filter(s => !(s.date === date && s.user === user && s.shiftType === shiftType));
    localStorage.setItem('shifts', JSON.stringify(shifts));
    renderCalendar();
}

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

// Initialize
renderUsers();
renderCalendar();