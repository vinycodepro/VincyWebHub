
// Load featured events on homepage
function loadFeaturedEvents() {
    const featuredContainer = document.getElementById('featuredEvents');
    if (!featuredContainer) return;

    const featuredEvents = sampleEvents.filter(event => event.featured);
    
    featuredEvents.forEach(event => {
        const eventCard = createEventCard(event);
        featuredContainer.appendChild(eventCard);
    });
}

// Create event card HTML
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
        <div class="event-image">
            ${event.image ? `<img src="${event.image}" alt="${event.title}" style="width:100%;height:100%;object-fit:cover;">` : 'Event Image'}
        </div>
        <div class="event-content">
            <div class="event-date">${formatDate(event.date)} at ${event.time}</div>
            <h3 class="event-title">${event.title}</h3>
            <div class="event-location">📍 ${event.location}</div>
            <div class="event-category">🏷️ ${event.category}</div>
            <p class="event-description">${event.description}</p>
            <a href="event-detail.html?id=${event.id}" class="event-link">View Details</a>
        </div>
    `;
    return card;
}

// Format date for display
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedEvents();
});