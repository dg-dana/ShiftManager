let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthYear = document.getElementById('calendar-month-year');
  const date = new Date(currentYear, currentMonth, 1);
  const monthName = date.toLocaleString('default', { month: 'long' });
  monthYear.textContent = `${monthName} ${currentYear}`;

  const firstDay = date.getDay() || 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  grid.innerHTML = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    .map(day => `<div class="day">${day}</div>`).join('');

  for (let i = 1; i < firstDay; i++) {
    grid.innerHTML += '<div class="day"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    const dayShifts = shifts.filter(s => s.date === dateStr);
    const shiftHTML = dayShifts.map(s => {
      const user = users.find(u => u.id === s.userId);
      return `
        <div class="shift" style="background: ${user.color};" onclick="deleteShift(${s.userId}, '${s.date}', '${s.templateCode}')">
          ${user.name}: ${s.shiftName}
          <span class="tooltip">${s.startTime} - ${s.endTime}</span>
        </div>
      `;
    }).join('');
    grid.innerHTML += `<div class="day">${day}${shiftHTML}</div>`;
  }
}

function deleteShift(userId, date, code) {
  if (confirm('Delete this shift?')) {
    shifts = shifts.filter(s => !(s.userId === userId && s.date === date && s.templateCode === code));
    localStorage.setItem('shifts', JSON.stringify(shifts));
    renderCalendar();
  }
}

function prevMonth() {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  renderCalendar();
}

function nextMonth() {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  renderCalendar();
}