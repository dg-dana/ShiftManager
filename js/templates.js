import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function addTemplate() {
  const userId = document.getElementById('template-user').value; // Firestore doc ID (string)
  const code = document.getElementById('template-code').value.trim().toUpperCase();
  const name = document.getElementById('template-name').value.trim();
  const start = document.getElementById('template-start').value;
  const end = document.getElementById('template-end').value;

  const user = users.find(u => u.id === userId);

  if (user && code && name && !user.templates.find(t => t.code === code)) {
    const updatedTemplates = [...user.templates, { code, name, start, end }];

    try {
      await updateDoc(doc(window.db, "users", userId), {
        templates: updatedTemplates
      });

      // Clear form fields
      document.getElementById('template-code').value = '';
      document.getElementById('template-name').value = '';
      document.getElementById('template-start').value = '';
      document.getElementById('template-end').value = '';

      console.log(`Template ${code} added for user ${user.name}`);
    } catch (error) {
      console.error("Error adding template:", error);
      alert("Error adding template to database.");
    }
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
          <button onclick="removeTemplate('${u.id}', '${t.code}')">Delete</button>
        </div>
      `).join('')}
    </div>
  `).join('');
}

async function removeTemplate(userId, code) {
  const user = users.find(u => u.id === userId);
  if (user) {
    const updatedTemplates = user.templates.filter(t => t.code !== code);
    try {
      await updateDoc(doc(window.db, "users", userId), {
        templates: updatedTemplates
      });
      console.log(`Template ${code} removed for user ${user.name}`);
    } catch (error) {
      console.error("Error removing template:", error);
      alert("Error removing template from database.");
    }
  }
}
