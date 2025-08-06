function addTemplate() {
  const userId = parseInt(document.getElementById('template-user').value);
  const code = document.getElementById('template-code').value.trim().toUpperCase();
  const name = document.getElementById('template-name').value.trim();
  const start = document.getElementById('template-start').value;
  const end = document.getElementById('template-end').value;
  const user = users.find(u => u.id === userId);
  if (user && code && name && !user.templates.find(t => t.code === code)) {
    user.templates.push({ code, name, start, end });
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('template-code').value = '';
    document.getElementById('template-name').value = '';
    document.getElementById('template-start').value = '';
    document.getElementById('template-end').value = '';
    updateTemplateList();
  } else {
    alert('Select a user, provide unique code and name, or check inputs.');
  }
}

function updateTemplateList() {
  const templateList = document.getElementById('template-list');
  templateList.innerHTML = users.map(u => `
    <div>
      <strong>${u.name}</strong>:
      ${u.templates.map(t => `
        <div class="template-list-item">
          ${t.code} - ${t.name} (${t.start || 'N/A'} - ${t.end || 'N/A'})
          <button onclick="removeTemplate(${u.id}, '${t.code}')">Delete</button>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function removeTemplate(userId, code) {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.templates = user.templates.filter(t => t.code !== code);
    localStorage.setItem('users', JSON.stringify(users));
    updateTemplateList();
  }
}