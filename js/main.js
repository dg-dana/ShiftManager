(function() {
  const debugEl = document.getElementById('debug-console');
  
  function printToDebug(...args) {
    const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    debugEl.innerHTML += `<div>${message}</div>`;
    debugEl.scrollTop = debugEl.scrollHeight;
  }
  
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = function(...args) {
    originalLog.apply(console, args);
    printToDebug('[LOG]', ...args);
  };
  
  console.error = function(...args) {
    originalError.apply(console, args);
    printToDebug('<span style="color:red">[ERROR]</span>', ...args);
  };
})();

document.addEventListener('DOMContentLoaded', async () => {
    await loadUsersFromFirestore();
    await loadShiftsFromFirestore();
    updateUserList();
    updateUserSelects();
    updateTemplateList();
    renderCalendar();
});

// ==== LOAD DATA FROM FIRESTORE ====
async function loadUsersFromFirestore() {
    const snapshot = await db.collection("users").get();
    users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function loadShiftsFromFirestore() {
    const snapshot = await db.collection("shifts").get();
    shifts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ==== EXPORT DATA (JSON FILE) ====
async function exportData() {
    const usersSnap = await db.collection("users").get();
    const shiftsSnap = await db.collection("shifts").get();

    const data = {
        users: usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        shifts: shiftsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shift-calendar.json';
    a.click();
}

// ==== IMPORT DATA (UPLOAD TO FIRESTORE) ====
async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async e => {
        const data = JSON.parse(e.target.result);

        // Overwrite Firestore collections
        const batch = db.batch();

        // Clear existing data (optional: only if you want a full replace)
        const usersSnap = await db.collection("users").get();
        usersSnap.forEach(doc => batch.delete(doc.ref));

        const shiftsSnap = await db.collection("shifts").get();
        shiftsSnap.forEach(doc => batch.delete(doc.ref));

        // Add imported users
        (data.users || []).forEach(user => {
            const ref = db.collection("users").doc(user.id || undefined);
            batch.set(ref, user);
        });

        // Add imported shifts
        (data.shifts || []).forEach(shift => {
            const ref = db.collection("shifts").doc(shift.id || undefined);
            batch.set(ref, shift);
        });

        await batch.commit();

        // Reload app state
        await loadUsersFromFirestore();
        await loadShiftsFromFirestore();
        updateUserList();
        updateUserSelects();
        updateTemplateList();
        renderCalendar();

        alert('Data imported successfully!');
    };

    reader.readAsText(file);
}
