# Family Shift Calendar

A simple, free shift scheduling system for families, built with HTML, CSS, and JavaScript. Hosted on GitHub Pages, uses localStorage for data persistence.

## Features
- Add up to 5 users with custom names and colors.
- Create shift templates (e.g., "FD" for Fire Department, 06:45-14:45).
- Input shifts with simple codes (e.g., "FD 12.8", "NS 1.9-5.9").
- View shifts in month, week, or day calendar views.
- Mobile-responsive, family-friendly UI.
- Import/export data as JSON.

## Setup
1. Clone the repository.
2. Open `index.html` in a browser or host via GitHub Pages.
3. Use Replit for development and testing.

## Usage
1. **Add Users**: Enter a name, pick a color, click "Add User".
2. **Create Templates**: Select a user, enter shift code, name, and times.
3. **Add Shifts**: Select a user, type "CODE DATE" (e.g., "FD 12.8"), submit.
4. **View Calendar**: Toggle between month, week, or day views. Click shifts to delete.
5. **Backup**: Export data as JSON or import from a file.

## Deployment
- Push to a GitHub repository.
- Enable GitHub Pages in Settings > Pages > `main` branch.
- Access at `https://<username>.github.io/shift-calendar`.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: localStorage
- **Hosting**: GitHub Pages
- **Development**: Replit