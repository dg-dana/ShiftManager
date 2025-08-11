// Initialize users from localStorage or as an empty array
let users = JSON.parse(localStorage.getItem('users')) || [];

function addUser() {
  const nameInput = document.getElementById('user-name');
  const colorInput = document.getElementById('user-color');
  const name = nameInput.value.trim();
  const color = colorInput.value;

  // Log inputs for debugging
  console.log('Attempting to add user:', { name, color, userCount: users.length });

  // Validation
  if (!name) {
    alert('Please enter a name.');
    console.log('Error: Name is empty');
    return;
  }
  if (users.length >= 5) {
    alert('Maximum 5 users allowed.');
    console.log('Error: Max users reached');
    return;
  }
  if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
    alert('This name is already taken.');
    console.log('Error: Duplicate name');
    return;
  }

  // Create new user
  const user = {
    id: Date.now(),
    name,
    color,
    templates: []
  };
  users.push(user);

  // Save to localStorage
  try {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('User saved:', user);
  } catch (e) {
    alert('Error saving user to localStorage.');
    console.error('localStorage error:', e);
    return;
  }

  // Clear input and update UI
  nameInput.value = '';
  updateUserList();
  updateUserSelects();
}

function removeUser(id) {
  console.log('Removing user with id:', id);
  users = users.filter(u => u.id !== id);
  try {
    localStorage.setItem('users', JSON.stringify(users));
  } catch (e) {
    console.error('localStorage error:', e);
    alert('Error removing user.');
    return;
  }
  updateUserList();
  updateUserSelects();
}

function updateUserList() {
  const userList = document.getElementById('user-list');
  if (!userList) {
    console.error('Error: user-list element not found');
    return;
  }
  userList.innerHTML = users.map(u => `
    <div class="user-list-item">
      <span class="user-color" style="background: ${u.color};"></span>
      ${u.name}
      <button onclick="removeUser(${u.id})">Delete</button>
    </div>
  `).join('');
  console.log('User list updated:', users);
}

function updateUserSelects() {
  const activeSelect = document.getElementById('active-user');
  const templateSelect = document.getElementById('template-user');
  if (!activeSelect || !templateSelect) {
    console.error('Error: Select elements not found');
    return;
  }
  const options = ['<option value="">Select User</option>'].concat(
    users.map(u => `<option value="${u.id}">${u.name}</option>`)
  ).join('');
  activeSelect.innerHTML = options;
  templateSelect.innerHTML = options;
  console.log('User selects updated:', users);
}