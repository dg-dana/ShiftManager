let users = JSON.parse(localStorage.getItem('users')) || [];

function addUser() {
  const name = document.getElementById('user-name').value.trim();
  const color = document.getElementById('user-color').value;
  if (name && users.length < 5 && !users.find(u => u.name === name)) {
    const user = { id: Date.now(), name, color, templates: [] };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('user-name').value = '';
    updateUserList();
    updateUserSelects();
  } else {
    alert('Name is required, max 5 users, or name already exists.');
  }
}

function removeUser(id) {
  users = users.filter(u => u.id !== id);
  localStorage.setItem('users', JSON.stringify(users));
  updateUserList();
  updateUserSelects();
}

function updateUserList() {
  const userList = document.getElementById('user-list');
  userList.innerHTML = users.map(u => `
    <div class="user-list-item">
      <span class="user-color" style="background: ${u.color};"></span>
      ${u.name}
      <button onclick="removeUser(${u.id})">Delete</button>
    </div>
  `).join('');
}

function updateUserSelects() {
  const activeSelect = document.getElementById('active-user');
  const templateSelect = document.getElementById('template-user');
  const options = ['<option value="">Select User</option>'].concat(
    users.map(u => `<option value="${u.id}">${u.name}</option>`)
  ).join('');
  activeSelect.innerHTML = options;
  templateSelect.innerHTML = options;
}