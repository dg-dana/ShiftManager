# Family Shift Calendar

A simple, family-friendly shift scheduling system built with HTML, CSS, and JavaScript. Hosted on GitHub Pages and now using **Firebase Firestore** for real-time data persistence.

## Features
- Add up to 5 users with custom names and colors.
- Create shift templates for users (e.g., "FD" for Fire Department, 06:45-14:45).
- Assign shifts to users using simple codes (e.g., "FD 12.8", "NS 1.9-5.9").
- View shifts in **month, week, or day calendar views**.
- Mobile-responsive, clean, and intuitive UI.
- Real-time sync with Firebase Firestore.
- Import/export data as JSON for backup or migration.

## Setup
1. Clone the repository.
2. Configure Firebase and update `firebaseConfig` in your JS file.
3. Open `index.html` in a browser or host via GitHub Pages.
4. For development and testing, Replit or a local server works.

## Usage
1. **Add Users**: Enter a name, pick a color, click "Add User".
2. **Create Templates**: Select a user, enter shift code, name, start and end times.
3. **Add Shifts**: Select a user, type "CODE DATE" (e.g., "FD 12.8"), submit.
4. **View Calendar**: Toggle between month, week, or day views. Click shifts to delete.
5. **Backup**: Export data as JSON or import from a file.

## Deployment
- Push your code to a GitHub repository.
- Enable **GitHub Pages** in Settings > Pages > `main` branch.
- Access your calendar at `https://<username>.github.io/shift-calendar`.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: Firebase Firestore (replacing localStorage)
- **Hosting**: GitHub Pages
- **Development**: Replit (optional)
