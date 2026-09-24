# VincyWebHub

A lightweight community events platform built with plain HTML, CSS, and JavaScript. The project allows visitors to browse upcoming events and allows organizers to create, manage, and track events through a simple dashboard.

## Project Purpose

VincyWebHub is designed as a local event discovery and management portal for communities, organizers, and public audiences. It follows a static-site architecture and demonstrates how a small web app can provide:

- event browsing for the public
- organizer login and registration
- event creation and dashboard management
- event filtering, sorting, and search
- local persistence using browser storage

## Tech Stack

- HTML5 for page structure
- CSS3 for styling and responsive layout
- Vanilla JavaScript for interactivity
- Browser localStorage for persistence
- GitHub Pages for static hosting

## Project Structure

```text
VincyWebHub/
├── index.html
├── events.html
├── event-detail.html
├── create-event.html
├── organizer-login.html
├── organizer-dashboard.html
├── css/
│   ├── style.css
│   ├── auth.css
│   └── dashboard.css
├── js/
│   ├── main.js
│   ├── events.js
│   ├── event-detail.js
│   ├── create-event.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── event-manager.js
│   └── main.js
├── data/
│   └── events.json
└── README.md
```

## Core Features

### Public-facing site
- home page with featured events
- all-events page with searching and filtering
- event detail view for full event information
- category-based browsing and view toggles

### Organizer portal
- sign-in / sign-up panel
- password visibility toggle and strength indicators
- organizer dashboard with event overview
- create new event workflow
- delete and manage existing event records

### Event management logic
- event storage in localStorage
- organizer-user mapping
- event tracking by ID and organizer association
- sample data initialization for demo use

## Application Flow

### 1. Public browsing
A visitor opens the homepage, where featured events are displayed. From there they can navigate to the full events list and open details for a specific event.

### 2. Organizer access
An organizer logs in or registers via the organizer portal. Once authenticated, the system loads the dashboard and allows event management tasks.

### 3. Event creation
Organizers can create a new event with fields such as title, date, time, category, description, location, ticket link, and status.

### 4. Data persistence
All created and managed events are saved in the browser using `localStorage`, which keeps the app simple and functional without a backend server.

## Main Modules

### `index.html`
Landing page for the site. Displays the hero section and featured event cards.

### `events.html`
Main event discovery page with filters, search, sorting, and event grid/list/calendar views.

### `event-detail.html`
Detailed event page showing description, organizer information, date, location, and links.

### `organizer-login.html`
Organizer authentication page with tabs for login and registration.

### `organizer-dashboard.html`
Dashboard used by organizers to track their events, views, and statuses.

### `create-event.html`
Form page for creating and publishing events.

### `js/event-manager.js`
Core data layer for event operations such as create, read, update, delete, and validation.

### `js/auth.js`
Handles organizer authentication logic, session storage, registration, and password interactions.

### `js/dashboard.js`
Loads organizer statistics, tables, activity, and dashboard-specific UI logic.

### `js/events.js`
Implements event filtering, sorting, search, and public catalog behavior.

### `js/main.js`
Homepage logic for rendering featured cards and page initialization.

### `js/event-detail.js`
Renders the detailed event page and related metadata.

### `js/create-event.js`
Handles event form submission and creation logic.

## Data Model

### Event Object

```javascript
{
  id: 1,
  title: "Community Jazz Night",
  date: "2024-02-15",
  time: "19:00",
  endDate: "2024-02-15",
  endTime: "22:00",
  location: "Downtown Music Hall",
  address: "123 Main Street, Cityville",
  category: "Music",
  description: "An evening of smooth jazz with local musicians.",
  fullDescription: "Detailed event description...",
  image: "images/jazz-night.jpg",
  organizer: "City Arts Council",
  organizerId: 1,
  organizerEmail: "arts@citycouncil.gov",
  website: "https://cityarts.org",
  ticketLink: "https://tickets.example.com/jazz-night",
  status: "published",
  price: "$25",
  views: 156,
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-10T14:30:00Z"
}
```

### Organizer User Object

```javascript
{
  id: 1,
  name: "City Arts Council",
  email: "arts@citycouncil.gov",
  password: "password123",
  orgType: "nonprofit",
  createdAt: "2025-10-15T00:00:00Z",
  events: [1, 3, 4]
}
```

## Browser Storage Keys

The app stores data in the browser using the following keys:

- `communityHubEvents` — all public event records
- `organizerUsers` — organizer accounts and associations
- `currentUser` — authenticated organizer session
- `authToken` — token-like authentication value

## Running the Project

### Option 1: Open directly in a browser
Because this is a static website, the app can be launched by opening `index.html` directly in the browser.

### Option 2: Use a local HTTP server
```bash
cd VincyWebHub
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Deployment

The project is ready for static hosting and is compatible with GitHub Pages. The repository metadata indicates the site is configured for GitHub Pages hosting.

## Notes and Limitations

This project is intentionally built as a frontend-only demo. It does not include:

- a real backend API
- database storage
- secure password hashing
- production-grade authentication
- server-side event validation
- role-based authorization

For a production deployment, the recommended next steps are:

- replace localStorage with a real database
- use a secure backend and authentication service
- introduce REST or GraphQL APIs
- protect organizer actions with server-side validation
- add image upload and media hosting
- enable analytics and reporting

## Strengths of the Project

- simple and easy to understand
- no dependency installation required
- fast to run and deploy
- good for demo, prototype, and portfolio use
- clean UI structure for event management

## Suggested Future Improvements

- migrate to a framework such as React or Vue
- add API integration with Firebase or Supabase
- implement real user authentication with JWT or OAuth
- allow event categories and tags to be managed dynamically
- support advanced filtering and calendar synchronization
- add form validation and accessibility improvements

## Summary

VincyWebHub is a static event hub project focused on community discovery and organizer management. It is a strong example of a lightweight, client-side web application that demonstrates event listing, creation workflows, user authentication simulation, and real browser persistence without requiring a full backend stack.

This makes it well suited for a prototype, portfolio project, or a starting point for a larger event platform.

## License

This project currently does not declare a license in the repository metadata. If you intend to publish or share it publicly, adding an explicit license is recommended.

---

This documentation is intentionally written as a practical project overview for developers and contributors working on VincyWebHub.

