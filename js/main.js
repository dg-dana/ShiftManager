document.addEventListener('DOMContentLoaded', () => {
  updateUserList();
  updateUserSelects();
  updateTemplateList();
  renderCalendar();
});

// Import/Export functionality
function exportData() {
  const data = { users, shifts };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'shift-calendar.json';
  a.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      const data = JSON.parse(e.target.result);
      users = data.users || [];
      shifts = data.shifts || [];
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('shifts', JSON.stringify(shifts));
      updateUserList();
      updateUserSelects();
      updateTemplateList();
      renderCalendar();
    };
    reader.readAsText(file);
  }
}