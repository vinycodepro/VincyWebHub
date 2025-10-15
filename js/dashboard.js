// Organizer Dashboard System
class OrganizerDashboard {
    constructor() {
        this.currentUser = null;
        this.userEvents = [];
        this.filteredEvents = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadUserData();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    checkAuthentication() {
        const userData = localStorage.getItem('currentUser');
        const authToken = localStorage.getItem('authToken');
        
        if (!userData || !authToken) {
            window.location.href = 'organizer-login.html';
            return;
        }
        
        this.currentUser = JSON.parse(userData);
        this.updateUserGreeting();
    }

    updateUserGreeting() {
        const greetingElement = document.getElementById('userGreeting');
        if (greetingElement && this.currentUser) {
            greetingElement.textContent = `Welcome, ${this.currentUser.name}!`;
        }
    }

    loadUserData() {
        // Load user's events from localStorage
        const allEvents = this.getAllEvents();
        this.userEvents = allEvents.filter(event => 
            this.currentUser.events.includes(event.id)
        );
    }



       setupEventListeners() {
        // Logout button
        document.getElementById('logoutButton').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Event filter
        document.getElementById('eventFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterEvents();
        });

        // Event search
        document.getElementById('eventSearch').addEventListener('input', (e) => {
            this.filterEvents(e.target.value);
        });

        // Export events
        document.getElementById('exportEvents').addEventListener('click', () => {
            this.exportEvents();
        });

        // Delete modal
        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Close modal when clicking outside
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') {
                this.closeDeleteModal();
            }
        });
    }

    loadDashboardData() {
        this.updateStats();
        this.filterEvents();
        this.loadRecentActivity();
        this.loadUpcomingEvents();
    }

    updateStats() {
        const totalEvents = this.userEvents.length;
        const publishedEvents = this.userEvents.filter(event => event.status === 'published').length;
        const draftEvents = this.userEvents.filter(event => event.status === 'draft').length;
        const totalViews = this.userEvents.reduce((sum, event) => sum + (event.views || 0), 0);

        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('publishedEvents').textContent = publishedEvents;
        document.getElementById('draftEvents').textContent = draftEvents;
        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
    }

    filterEvents(searchTerm = '') {
        let filtered = [...this.userEvents];

        // Apply status filter
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'past') {
                const today = new Date();
                filtered = filtered.filter(event => new Date(event.date) < today);
            } else {
                filtered = filtered.filter(event => event.status === this.currentFilter);
            }
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(event => 
                event.title.toLowerCase().includes(term) ||
                event.description.toLowerCase().includes(term) ||
                event.location.toLowerCase().includes(term)
            );
        }

        this.filteredEvents = filtered;
        this.renderEventsTable();
    }

    renderEventsTable() {
        const tbody = document.getElementById('eventsTableBody');
        const noEventsMessage = document.getElementById('noEventsMessage');

        if (this.filteredEvents.length === 0) {
            tbody.innerHTML = '';
            noEventsMessage.style.display = 'block';
            return;
        }

        noEventsMessage.style.display = 'none';

        tbody.innerHTML = this.filteredEvents.map(event => `
            <tr>
                <td>
                    <strong>${event.title}</strong>
                    <div class="event-category" style="font-size: 0.8rem; color: #7f8c8d; margin-top: 0.25rem;">
                        ${event.category}
                    </div>
                </td>
                <td>
                    ${this.formatDate(event.date)}<br>
                    <small style="color: #7f8c8d;">${event.time}</small>
                </td>
                <td>
                    <span class="status-badge status-${event.status}">
                        ${event.status}
                    </span>
                </td>
                <td>${event.views.toLocaleString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-view" onclick="dashboard.viewEvent(${event.id})">
                            View
                        </button>
                        <button class="btn-sm btn-edit" onclick="dashboard.editEvent(${event.id})">
                            Edit
                        </button>
                        <button class="btn-sm btn-delete" onclick="dashboard.openDeleteModal(${event.id}, '${event.title}')">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadRecentActivity() {
        const activityList = document.getElementById('activityList');
        
        // Sort events by update date for activity feed
        const recentActivities = [...this.userEvents]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);
        
        if (recentActivities.length === 0) {
            activityList.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No recent activity</p>';
            return;
        }

        activityList.innerHTML = recentActivities.map(event => {
            const action = event.status === 'published' ? 'published' : 
                          event.updatedAt !== event.createdAt ? 'updated' : 'created';
            
            const actionText = {
                'published': 'Published event',
                'updated': 'Updated event', 
                'created': 'Created event'
            }[action];
            
            const icon = {
                'published': '✅',
                'updated': '✏️',
                'created': '➕'
            }[action];
            
            return `
                <div class="activity-item">
                    <div class="activity-icon ${action}">${icon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${actionText}: ${event.title}</div>
                        <div class="activity-time">${this.formatRelativeTime(event.updatedAt)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadUpcomingEvents() {
        const upcomingContainer = document.getElementById('upcomingEvents');
        const today = new Date();
        
        const upcoming = this.userEvents
            .filter(event => event.status === 'published' && new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);
        
        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No upcoming events</p>';
            return;
        }

        upcomingContainer.innerHTML = upcoming.map(event => `
            <div class="upcoming-event">
                <div class="upcoming-event-title">${event.title}</div>
                <div class="upcoming-event-date">
                    ${this.formatDate(event.date)} at ${event.time}
                </div>
            </div>
        `).join('');
    }

    viewEvent(eventId) {
        window.open(`event-detail.html?id=${eventId}`, '_blank');
    }

    editEvent(eventId) {
        // Redirect to edit event page (to be implemented)
        window.location.href = `create-event.html?edit=${eventId}`;
    }

    openDeleteModal(eventId, eventTitle) {
        this.eventToDelete = eventId;
        document.getElementById('deleteEventTitle').textContent = eventTitle;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    closeDeleteModal() {
        this.eventToDelete = null;
        document.getElementById('deleteModal').classList.add('hidden');
    }

    confirmDelete() {
        if (this.eventToDelete) {
            this.deleteEvent(this.eventToDelete);
            this.closeDeleteModal();
        }
    }

loadUserData() {
    // Load user's events from event manager
    this.userEvents = eventManager.getEventsByOrganizer(this.currentUser.id);
}

// Remove the getAllEvents() method since we're using eventManager

// Update the deleteEvent method:
deleteEvent(eventId) {
    if (eventManager.deleteEvent(eventId)) {
        // Refresh dashboard
        this.loadDashboardData();
        this.showNotification('Event deleted successfully');
        return true;
    }
    return false;
}

    updateStoredEvents() {
        // In a real app, this would be an API call
        // For demo, we'll update localStorage
        const allEvents = this.getAllEvents().filter(event => 
            !this.userEvents.find(ue => ue.id === event.id) || 
            this.userEvents.find(ue => ue.id === event.id)
        );
        // Note: In a real app, you'd have proper event storage
    }

    exportEvents() {
        const eventsToExport = this.userEvents.map(event => ({
            Title: event.title,
            Date: event.date,
            Time: event.time,
            Location: event.location,
            Category: event.category,
            Status: event.status,
            Views: event.views
        }));

        const csv = this.convertToCSV(eventsToExport);
        this.downloadCSV(csv, 'my-events.csv');
        
        this.showNotification('Events exported successfully');
    }

    convertToCSV(objArray) {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = `${Object.keys(array[0]).map(value => `"${value}"`).join(",")}\r\n`;

        return array.reduce((str, next) => {
            str += `${Object.values(next).map(value => `"${value}"`).join(",")}\r\n`;
            return str;
        }, str);
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'organizer-login.html';
    }

    // Utility methods
    formatDate(dateString) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return this.formatDate(dateString);
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1001;
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize dashboard when page loads
const dashboard = new OrganizerDashboard();
window.dashboard = dashboard;