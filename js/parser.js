let shifts = JSON.parse(localStorage.getItem('shifts')) || [];

function addShift() {
  const userId = parseInt(document.getElementById('active-user').value);
  const input = document.getElementById('shift-text').value.trim();
  const user = users.find(u => u.id === userId);
  if (!user || !input) {
    alert('Select a user and enter a shift.');
    return;
  }

  const [code, dateStr] = input.split(/\s+/);
  const template = user.templates.find(t => t.code === code.toUpperCase());
  if (!template) {
    alert('Invalid shift code.');
    return;
  }

  const dates = parseDateRange(dateStr);
  if (!dates) {
    alert('Invalid date format. Use DD.MM or DD.MM-DD.MM');
    return;
  }

  dates.forEach(date => {
    if (!shifts.find(s => s.userId === userId && s.date === date)) {
      shifts.push({
        userId,
        date,
        templateCode: code.toUpperCase(),
        shiftName: template.name,
        startTime: template.start,
        endTime: template.end
      });
    }
  });

  localStorage.setItem('shifts', JSON.stringify(shifts));
  document.getElementById('shift-text').value = '';
  renderCalendar();
}

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
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}