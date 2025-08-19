// ==== SHIFT ADDING USING FIRESTORE (MODULAR SDK) ====
async function addShift() {
    const userId = document.getElementById('active-user').value.trim();
    const input = document.getElementById('shift-text').value.trim();
    const user = users.find(u => u.id === userId);

    if (!user || !input) {
        alert('Select a user and enter a shift.');
        return;
    }

    const [code, dateStr] = input.split(/\s+/);
    const template = user.templates?.find(t => t.code.toUpperCase() === code.toUpperCase());

    if (!template) {
        alert('Invalid shift code.');
        return;
    }

    const dates = parseDateRange(dateStr);
    if (!dates || dates.length === 0) {
        alert('Invalid date format. Use DD.MM or DD.MM-DD.MM');
        return;
    }

    // Add each shift to Firestore if it doesn't already exist
    for (let date of dates) {
        const existing = shifts.find(s => s.userId === userId && s.date === date);
        if (!existing) {
            await addDoc(collection(db, "shifts"), {
                userId: userId,
                date: date, // Stored as YYYY-MM-DD
                templateCode: code.toUpperCase(),
                shiftName: template.name,
                startTime: template.start || null,
                endTime: template.end || null,
                createdAt: serverTimestamp()
            });
        }
    }

    document.getElementById('shift-text').value = '';
    renderCalendar(); // update calendar immediately
}

// ==== DATE RANGE PARSER ====
function parseDateRange(dateStr) {
    const currentYear = new Date().getFullYear();
    const dateRegex = /^(\d{1,2})\.(\d{1,2})(?:-(\d{1,2})\.(\d{1,2}))?$/;
    const match = dateStr.match(dateRegex);
    if (!match) return null;

    const startDay = parseInt(match[1], 10);
    const startMonth = parseInt(match[2], 10) - 1; // JS months 0-11

    // Single date
    if (!match[3]) {
        return [formatDate(new Date(currentYear, startMonth, startDay))];
    }

    // Date range
    const endDay = parseInt(match[3], 10);
    const endMonth = parseInt(match[4], 10) - 1;

    const dates = [];
    let current = new Date(currentYear, startMonth, startDay);
    const end = new Date(currentYear, endMonth, endDay);

    // Safety: prevent infinite loops for invalid ranges
    if (current > end) return null;

    while (current <= end) {
        dates.push(formatDate(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

// ==== DATE FORMATTING ====
function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
