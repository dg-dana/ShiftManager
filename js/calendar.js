let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentWeekStart = new Date(currentYear, currentMonth, 1);
let currentDay = new Date(currentYear, currentMonth, 1);
let currentView = 'month';

// Store shifts fetched from Firestore
let shifts = [];

// Firebase Firestore collection reference (assuming 'shifts' collection)
const shiftsCol = collection(db, "shifts");

// Listen for realtime updates
onSnapshot(shiftsCol, snapshot => {
  shifts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    shifts.push({
      id: doc.id,
      userId: data.userId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      shiftName: data.shiftName,
      templateCode: data.templateCode || '',
      note: data.note || ''
    });
  });
  renderCalendar();
});

function setView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`${view}-view`).classList.add('active');
  renderCalendar();
}

function prevPeriod() {
  if (currentView === 'month') {
    if (currentMonth === 0) { currentMonth = 11; currentYear--; } else { currentMonth--; }
  } else if (currentView === 'week') {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  } else if (currentView === 'day') {
    currentDay.setDate(currentDay.getDate() - 1);
  }
  renderCalendar();
}

function nextPeriod() {
  if (currentView === 'month') {
    if (currentMonth === 11) { currentMonth = 0; currentYear++; } else { currentMonth++; }
  } else if (currentView === 'week') {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  } else if (currentView === 'day') {
    currentDay.setDate(currentDay.getDate() + 1);
  }
  renderCalendar();
}

// ---------- Calendar Rendering (month/week/day) ----------
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthYear = document.getElementById('calendar-month-year');
  grid.className = `${currentView}-view`;

  if (currentView === 'month') renderMonthView(grid, monthYear);
  else if (currentView === 'week') renderWeekView(grid, monthYear);
  else if (currentView === 'day') renderDayView(grid, monthYear);
}

function renderMonthView(grid, monthYear) {
  const date = new Date(currentYear, currentMonth, 1);
  const monthName = date.toLocaleString('default', { month: 'long' });
  monthYear.textContent = `${monthName} ${currentYear}`;

  const firstDay = (date.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  let tableHTML = '<table class="calendar-table"><thead><tr>';
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
    tableHTML += `<th class="day-header">${day}</th>`;
  });
  tableHTML += '</tr></thead><tbody>';

  let currentWeek = '<tr>';
  let cellCount = 0;

  for (let i = 0; i < firstDay; i++) { currentWeek += '<td class="day empty-day"></td>'; cellCount++; }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    const dayShifts = shifts.filter(s => s.date === dateStr);
    const shiftHTML = dayShifts.map(s => {
      const user = users.find(u => u.id === s.userId) || { name: 'Unknown', color: '#ccc' };
      return `
        <div class="shift" style="background: ${user.color};" onclick="deleteShift('${s.id}')">
          ${user.name}: ${s.shiftName}
          <span class="tooltip">${s.startTime || 'N/A'} - ${s.endTime || 'N/A'}</span>
        </div>
      `;
    }).join('');
    
    currentWeek += `<td class="day"><div class="day-number">${day}</div>${shiftHTML}</td>`;
    cellCount++;
    if (cellCount % 7 === 0) { currentWeek += '</tr>'; tableHTML += currentWeek; currentWeek = '<tr>'; }
  }

  while (cellCount % 7 !== 0) { currentWeek += '<td class="day empty-day"></td>'; cellCount++; }
  if (currentWeek !== '<tr>') { currentWeek += '</tr>'; tableHTML += currentWeek; }

  tableHTML += '</tbody></table>';
  grid.innerHTML = tableHTML;
}

function renderWeekView(grid, monthYear) {
  const weekStart = new Date(currentWeekStart);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
  monthYear.textContent = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

  let tableHTML = '<table class="calendar-table"><thead><tr>';
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((day, i) => {
    const current = new Date(weekStart); current.setDate(weekStart.getDate() + i);
    tableHTML += `<th class="day-header">${day}<br>${current.getDate()}</th>`;
  });
  tableHTML += '</tr></thead><tbody><tr>';

  for (let i = 0; i < 7; i++) {
    const current = new Date(weekStart); current.setDate(weekStart.getDate() + i);
    const dateStr = formatDate(current);
    const dayShifts = shifts.filter(s => s.date === dateStr);
    const shiftHTML = dayShifts.map(s => {
      const user = users.find(u => u.id === s.userId) || { name: 'Unknown', color: '#ccc' };
      return `<div class="shift" style="background: ${user.color};" onclick="deleteShift('${s.id}')">${user.name}: ${s.shiftName}<span class="tooltip">${s.startTime || 'N/A'} - ${s.endTime || 'N/A'}</span></div>`;
    }).join('');
    tableHTML += `<td class="day">${shiftHTML}</td>`;
  }

  tableHTML += '</tr></tbody></table>';
  grid.innerHTML = tableHTML;
}

function renderDayView(grid, monthYear) {
  const dateStr = formatDate(currentDay);
  monthYear.textContent = currentDay.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const dayShifts = shifts.filter(s => s.date === dateStr);
  const shiftHTML = dayShifts.map(s => {
    const user = users.find(u => u.id === s.userId) || { name: 'Unknown', color: '#ccc' };
    return `<div class="shift" style="background: ${user.color};" onclick="deleteShift('${s.id}')">${user.name}: ${s.shiftName} (${s.startTime || 'N/A'} - ${s.endTime || 'N/A'})</div>`;
  }).join('') || 'No shifts';

  grid.innerHTML = `<table class="calendar-table"><thead><tr><th>${currentDay.getDate()}</th></tr></thead><tbody><tr><td>${shiftHTML}</td></tr></tbody></table>`;
}

// ---------- Delete shift from Firestore ----------
async function deleteShift(docId) {
  if (!docId) return;
  if (confirm('Delete this shift?')) {
    await deleteDoc(doc(db, "shifts", docId));
  }
}

function formatDate(date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
}
