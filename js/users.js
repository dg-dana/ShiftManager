// ==== FIRESTORE-BACKED USERS ARRAY ====
let users = [];

// ==== FIRESTORE IMPORTS ====
import { 
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firestore references
const usersRef = collection(window.db, "users");
const usersQuery = query(usersRef, orderBy("createdAt", "asc"));

// ==== REAL-TIME LISTENER ====
onSnapshot(usersQuery, snapshot => {
  users = snapshot.docs.map(docSnap => ({
    id: docSnap.id, // Firestore document ID
    ...docSnap.data()
  }));
  updateUserList();
  updateUserSelects();
});

// ==== ADD USER ====
async function addUser() {
  const nameInput = document.getElementById('user-name');
  const colorInput = document.getElementById('user-color');
  const name = nameInput.value.trim();
  const color = colorInput.value;

  console.log('Attempting to add user:', { name, color, userCount: users.length });

  // Validation
  if (!name) return alert('Please enter a name.');
  if (users.length >= 5) return alert('Maximum 5 users allowed.');
  if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) return alert('This name is already taken.');

  try {
    await addDoc(usersRef, {
      name,
      color,
      templates: [],
      createdAt: new Date()
    });
    console.log('User added to Firestore:', name);
    nameInput.value = '';
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Error adding user to database.');
  }
}

// ==== REMOVE USER ====
async function removeUser(id) {
  console.log('Removing user with id:', id);
  try {
    await deleteDoc(doc(window.db, "users", id));
  } catch (error) {
    console.error('Error removing user:', error);
    alert('Error removing user.');
  }
}

// ==== UPDATE USER LIST ====
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
      <button onclick="removeUser('${u.id}')">Delete</button>
    </div>
  `).join('');
  console.log('User list updated:', users);
}

// ==== UPDATE USER SELECT DROPDOWNS ====
function updateUserSelects() {
  const activeSelect = document.getElementById('active-user');
  const templateSelect = document.getElementById('template-user');
  if (!activeSelect || !templateSelect) {
    console.error('Error: Select elements not found');
    return;
  }

  const options = ['<option value="">Select User</option>']
    .concat(users.map(u => `<option value="${u.id}">${u.name}</option>`))
    .join('');

  activeSelect.innerHTML = options;
  templateSelect.innerHTML = options;
  console.log('User selects updated:', users);
}
