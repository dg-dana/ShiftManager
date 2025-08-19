// ==== SHIFT ADDING USING FIRESTORE (MULTI-SHIFT INPUT) ====
async function addShift() {
    const userId = document.getElementById('active-user').value.trim();
    const input = document.getElementById('shift-text').value.trim();
    const user = users.find(u => u.id === userId);

    if (!user || !input) {
        alert('Select a user and enter shift(s).');
        return;
    }

    // Split multiple shifts by semicolon
    const entries = input.split(';').map(s => s.trim()).filter(Boolean);

    for (let entry of entries) {
        const [code, dateStrs] = entry.split(/\s+/, 2);
        if (!code || !dateStrs) {
            alert(`Invalid format in "${entry}". Use CODE DD.MM or CODE DD.MM-DD.MM`);
            continue;
        }

        const template = user.templates?.find(t => t.code.toUpperCase() === code.toUpperCase());
        if (!template) {
            alert(`Invalid shift code "${code}"`);
            continue;
        }

        const dates = parseMultipleDateRanges(dateStrs);
        if (!dates || dates.length === 0) {
            alert(`Invalid date format in "${dateStrs}"`);
            continue;
        }

        for (let date of dates) {
            const existing = shifts.find(s => s.userId === userId && s.date === date && s.templateCode === code.toUpperCase());
            if (!existing) {
                await addDoc(collection(db, "shifts"), {
                    userId: userId,
                    date: date,
                    templateCode: code.toUpperCase(),
                    shiftName: template.name,
                    startTime: template.start || null,
                    endTime: template.end || null,
                    createdAt: serverTimestamp()
                });
            }
        }
    }

    document.getElementById('shift-text').value = '';
    await loadShiftsFromFirestore();
    renderCalendar(); // update calendar immediately
}

// ==== MULTI-RANGE DATE PARSER ====
function parseMultipleDateRanges(input) {
    if (!input) return null;

    const parts = input.split(',').map(s => s.trim()).filter(Boolean);
    let allDates = [];

    for (let part of parts) {
        const dates = parseDateRange(part);
        if (!dates) return null; // invalid format
        allDates = allDates.concat(dates);
    }

    // Remove duplicates
    return [...new Set(allDates)];
}

// ==== SINGLE DATE RANGE PARSER (SUPPORTS CROSS-YEAR) ====
function parseDateRange(dateStr) {
    const currentYear = new Date().getFullYear();
    const dateRegex = /^(\d{1,2})\.(\d{1,2})(?:-(\d{1,2})\.(\d{1,2}))?$/;
    const match = dateStr.match(dateRegex);
    if (!match) return null;

    const startDay = parseInt(match[1], 10);
    const startMonth = parseInt(match[2], 10) - 1;

    if (!match[3]) {
        return [formatDate(new Date(currentYear, startMonth, startDay))];
    }

    const endDay = parseInt(match[3], 10);
    const endMonth = parseInt(match[4], 10) - 1;

    let dates = [];
    let current = new Date(currentYear, startMonth, startDay);
    let end = new Date(currentYear, endMonth, endDay);

    if (end < current) {
        end.setFullYear(currentYear + 1);
    }

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
