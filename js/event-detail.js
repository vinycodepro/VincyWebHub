// Event Detail Page Functionality
class EventDetail {
    constructor() {
        this.event = null;
        this.map = null;
        this.init();
    }

    init() {
        this.loadEventData();
        this.setupEventListeners();
    }

    loadEventData() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = parseInt(urlParams.get('id'));
        
        // Find event in our sample data (in production, this would be an API call)
        const events = getEventsData();
        this.event = events.find(event => event.id === eventId);
        
        if (this.event) {
            this.renderEventDetails();
            this.loadSimilarEvents();
        } else {
            this.showError();
        }
    }

    renderEventDetails() {
        // Basic Info
        document.getElementById('eventTitle').textContent = this.event.title;
        document.getElementById('eventCategory').textContent = this.event.category;
        document.getElementById('eventCategory').className = `event-category-badge category-${this.event.category.toLowerCase()}`;
        
        // Date and Time
        const eventDate = new Date(this.event.date);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = eventDate.toLocaleDateString('en-US', options);
        
        document.getElementById('eventDateTime').textContent = 
            `${dateString} at ${this.event.time}${this.event.endTime ? ` - ${this.event.endTime}` : ''}`;
        
        document.getElementById('sidebarDate').textContent = dateString;
        document.getElementById('sidebarTime').textContent = 
            `${this.event.time}${this.event.endTime ? ` - ${this.event.endTime}` : ''}`;

        // Location and Price
        document.getElementById('eventLocation').textContent = this.event.location;
        document.getElementById('eventPrice').textContent = this.event.price;
        document.getElementById('eventAddress').textContent = this.event.address || this.event.location;
        document.getElementById('eventOrganizer').textContent = this.event.organizer;
        
        document.getElementById('sidebarCategory').textContent = this.event.category;
        document.getElementById('sidebarPrice').textContent = this.event.price;

        // Description
        const descriptionElement = document.getElementById('eventDescription');
        if (this.event.fullDescription) {
            descriptionElement.innerHTML = this.event.fullDescription.replace(/\n/g, '<br>');
        } else {
            descriptionElement.textContent = this.event.description;
        }

        // Organizer
        document.getElementById('organizerDetails').innerHTML = `
            <strong>${this.event.organizer}</strong><br>
            ${this.event.organizerEmail ? this.event.organizerEmail : ''}
        `;
        
        if (this.event.organizerEmail) {
            document.getElementById('organizerContact').href = `mailto:${this.event.organizerEmail}?subject=Question about ${this.event.title}`;
        }

        // External Link
        const externalLink = document.getElementById('externalLink');
        if (this.event.externalLink) {
            externalLink.href = this.event.externalLink;
            if (this.event.price === 'Free') {
                externalLink.textContent = 'Register Free';
            } else if (this.event.price.toLowerCase().includes('free')) {
                externalLink.textContent = 'Get Free Tickets';
            } else {
                externalLink.textContent = 'Get Tickets';
            }
        } else {
            externalLink.style.display = 'none';
        }

        // Image
        const heroImage = document.getElementById('eventHeroImage');
        if (this.event.image) {
            heroImage.innerHTML = `<img src="${this.event.image}" alt="${this.event.title}">`;
        } else {
            heroImage.textContent = 'Event Image';
        }

        // Initialize Map
        this.initializeMap();
    }

    initializeMap() {
        // For demo purposes, we'll use a default location
        // In production, you would geocode the address
        const defaultCoords = [40.7128, -74.0060]; // New York coordinates
        
        try {
            this.map = L.map('map').setView(defaultCoords, 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
            
            L.marker(defaultCoords)
                .addTo(this.map)
                .bindPopup(`<strong>${this.event.location}</strong><br>${this.event.address || ''}`)
                .openPopup();
                
        } catch (error) {
            console.error('Error initializing map:', error);
            document.getElementById('map').innerHTML = 
                '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">Map unavailable</div>';
        }
    }

    loadSimilarEvents() {
        const similarEventsContainer = document.getElementById('similarEvents');
        const events = getEventsData();
        
        // Find events in the same category, excluding current event
        const similarEvents = events
            .filter(event => 
                event.id !== this.event.id && 
                event.category === this.event.category &&
                event.status === 'published'
            )
            .slice(0, 3); // Show max 3 similar events
        
        if (similarEvents.length === 0) {
            similarEventsContainer.innerHTML = '<p>No similar events found.</p>';
            return;
        }
        
        similarEventsContainer.innerHTML = similarEvents.map(event => `
            <div class="similar-event-item" onclick="window.location.href='event-detail.html?id=${event.id}'">
                <div class="similar-event-title">${event.title}</div>
                <div class="similar-event-date">${formatDate(event.date)} at ${event.time}</div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Share button
        document.getElementById('shareButton').addEventListener('click', () => this.openShareModal());
        
        // Save button
        document.getElementById('saveButton').addEventListener('click', () => this.saveEvent());
        
        // Share modal
        document.querySelector('.modal-close').addEventListener('click', () => this.closeShareModal());
        document.getElementById('copyUrl').addEventListener('click', () => this.copyShareUrl());
        
        // Platform share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.target.getAttribute('data-platform');
                if (platform !== 'copy') {
                    this.shareOnPlatform(platform);
                }
            });
        });
        
        // Close modal when clicking outside
        document.getElementById('shareModal').addEventListener('click', (e) => {
            if (e.target.id === 'shareModal') {
                this.closeShareModal();
            }
        });
    }

    openShareModal() {
        const modal = document.getElementById('shareModal');
        const shareUrl = document.getElementById('shareUrl');
        
        // Set current page URL as share URL
        shareUrl.value = window.location.href;
        
        modal.classList.remove('hidden');
    }

    closeShareModal() {
        document.getElementById('shareModal').classList.add('hidden');
    }

    copyShareUrl() {
        const shareUrl = document.getElementById('shareUrl');
        shareUrl.select();
        shareUrl.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            navigator.clipboard.writeText(shareUrl.value);
            const copyButton = document.getElementById('copyUrl');
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    shareOnPlatform(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(this.event.title);
        const text = encodeURIComponent(`Check out this event: ${this.event.title}`);
        
        let shareUrl;
        
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            default:
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    saveEvent() {
        const saveButton = document.getElementById('saveButton');
        const originalText = saveButton.textContent;
        
        // Get saved events from localStorage
        let savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
        
        if (savedEvents.includes(this.event.id)) {
            // Remove from saved
            savedEvents = savedEvents.filter(id => id !== this.event.id);
            saveButton.textContent = 'Save Event';
            this.showNotification('Event removed from saved events');
        } else {
            // Add to saved
            savedEvents.push(this.event.id);
            saveButton.textContent = 'Saved ✓';
            this.showNotification('Event saved to your events');
        }
        
        localStorage.setItem('savedEvents', JSON.stringify(savedEvents));
        
        // Revert button text after 2 seconds
        setTimeout(() => {
            if (savedEvents.includes(this.event.id)) {
                saveButton.textContent = 'Saved ✓';
            } else {
                saveButton.textContent = originalText;
            }
        }, 2000);
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ecc71;
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

    showError() {
        document.querySelector('main').innerHTML = `
            <div class="error-container" style="text-align: center; padding: 4rem 2rem;">
                <h2>Event Not Found</h2>
                <p>The event you're looking for doesn't exist or has been removed.</p>
                <a href="events.html" class="cta-button primary">Browse All Events</a>
            </div>
        `;
    }
}

class EventDetail {
    constructor(eventManager) {
        this.eventManager = eventManager;
    }

    loadEventData() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = parseInt(urlParams.get('id'));

        if (isNaN(eventId)) {
            this.showError();
            return;
        }

        this.event = this.eventManager.getEventById(eventId);

        if (this.event) {
            this.eventManager.incrementEventViews(eventId);
            this.renderEventDetails();
            this.loadSimilarEvents();
        } else {
            this.showError();
        }
    }

    renderEventDetails() { /* ... */ }
    loadSimilarEvents() { /* ... */ }
    showError() { /* ... */ }
}



function formatDate(dateString) {
    const eventDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return eventDate.toLocaleDateString('en-US', options);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    new EventDetail();
});