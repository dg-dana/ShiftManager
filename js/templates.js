// ==== TEMPLATE MANAGEMENT ====
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function addTemplate() {
    const userId = document.getElementById('template-user').value; // Firestore doc ID
    const code = document.getElementById('template-code').value.trim().toUpperCase();
    const name = document.getElementById('template-name').value.trim();
    const start = document.getElementById('template-start').value;
    const end = document.getElementById('template-end').value;

    const user = users.find(u => u.id === userId);

    if (!user) return alert("Select a valid user.");
    if (!code || !name) return alert("Provide a unique code and name.");
    if (user.templates?.find(t => t.code === code)) return alert("Template code already exists.");

    const updatedTemplates = [...(user.templates || []), { code, name, start, end }];

    try {
        await updateDoc(doc(window.db, "users", userId), {
            templates: updatedTemplates
        });

        // Clear input fields
        document.getElementById('template-code').value = '';
        document.getElementById('template-name').value = '';
        document.getElementById('template-start').value = '';
        document.getElementById('template-end').value = '';

        console.log(`Template ${code} added for user ${user.name}`);
        updateTemplateList();
    } catch (error) {
        console.error("Error adding template:", error);
        alert("Failed to add template to database.");
    }
}

function updateTemplateList() {
    const templateList = document.getElementById('template-list');
    if (!templateList) return;

    templateList.innerHTML = users.map(user => `
        <div>
            <strong>${user.name}</strong>:
            ${(user.templates || []).map(t => `
                <div class="template-list-item">
                    ${t.code} - ${t.name} (${t.start || 'N/A'} - ${t.end || 'N/A'})
                    <button onclick="removeTemplate('${user.id}', '${t.code}')">Delete</button>
                </div>
            `).join('')}
        </div>
    `).join('');
}

async function removeTemplate(userId, code) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const updatedTemplates = (user.templates || []).filter(t => t.code !== code);

    try {
        await updateDoc(doc(window.db, "users", userId), {
            templates: updatedTemplates
        });
        console.log(`Template ${code} removed for user ${user.name}`);
        updateTemplateList();
    } catch (error) {
        console.error("Error removing template:", error);
        alert("Failed to remove template from database.");
    }
}

// Call this after users load to populate template user select
function updateTemplateUserSelect() {
    const select = document.getElementById('template-user');
    if (!select) return;

    select.innerHTML = '<option value="">Select User</option>';
    users.forEach(user => {
        const opt = document.createElement('option');
        opt.value = user.id;
        opt.textContent = user.name;
        select.appendChild(opt);
    });
}
