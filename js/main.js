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
    const snapshot = await getDocs(collection(db, "users"));
    users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function loadShiftsFromFirestore() {
    const snapshot = await getDocs(collection(db, "shifts"));
    shifts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ==== EXPORT DATA (JSON FILE) ====
async function exportData() {
    const usersSnap = await getDocs(collection(db, "users"));
    const shiftsSnap = await getDocs(collection(db, "shifts"));

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
        const batch = writeBatch(db);

        // Clear existing users
        const usersSnap = await getDocs(collection(db, "users"));
        usersSnap.forEach(docSnap => batch.delete(doc(db, "users", docSnap.id)));

        // Clear existing shifts
        const shiftsSnap = await getDocs(collection(db, "shifts"));
        shiftsSnap.forEach(docSnap => batch.delete(doc(db, "shifts", docSnap.id)));

        // Add imported users
        (data.users || []).forEach(user => {
            const ref = doc(db, "users", user.id || undefined);
            batch.set(ref, user);
        });

        // Add imported shifts
        (data.shifts || []).forEach(shift => {
            const ref = doc(db, "shifts", shift.id || undefined);
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
