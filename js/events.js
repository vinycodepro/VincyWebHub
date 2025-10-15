// Extended sample events data
const eventsData = [
    {
        id: 1,
        title: "Community Jazz Night",
        date: "2024-01-15",
        time: "19:00",
        endDate: "2024-01-15",
        endTime: "22:00",
        location: "Downtown Music Hall",
        address: "123 Main Street, Cityville",
        category: "Music",
        description: "An evening of smooth jazz with local musicians. Featuring performances from the City Jazz Quartet and special guests. Perfect for a romantic night out or relaxing with friends.",
        fullDescription: "Join us for an unforgettable evening of smooth jazz at the historic Downtown Music Hall. Our featured performers include the acclaimed City Jazz Quartet, along with special guest vocalist Sarah Johnson. The event includes:\n\n• Two sets of live jazz music\n• Cash bar with craft cocktails\n• Light appetizers\n• Optional dinner reservations available\n\nDoors open at 6:30 PM. First set begins at 7:00 PM.",
        image: "images/jazz-night.jpg",
        organizer: "City Arts Council",
        organizerEmail: "arts@citycouncil.gov",
        externalLink: "https://tickets.example.com/jazz-night",
        status: "published",
        featured: true,
        price: "$25"
    },
    {
        id: 2,
        title: "Startup Networking Mixer",
        date: "2024-01-18",
        time: "18:30",
        endDate: "2024-01-18",
        endTime: "21:00",
        location: "Tech Hub Center",
        address: "456 Innovation Drive, Techville",
        category: "Networking",
        description: "Connect with entrepreneurs, investors, and tech professionals in our monthly networking event.",
        fullDescription: "Our monthly startup networking mixer brings together the brightest minds in the tech community. This is your chance to:\n\n• Meet potential co-founders and team members\n• Connect with angel investors and VCs\n• Share ideas and get feedback\n• Find mentors and advisors\n\nIncludes complimentary drinks and appetizers. Business casual attire.",
        image: "images/networking.jpg",
        organizer: "Tech Community Group",
        organizerEmail: "events@techcommunity.org",
        externalLink: "https://meetup.com/tech-mixer",
        status: "published",
        featured: true,
        price: "Free"
    },
    {
        id: 3,
        title: "Yoga in the Park",
        date: "2024-01-20",
        time: "08:00",
        endDate: "2024-01-20",
        endTime: "09:30",
        location: "Central Park",
        address: "Central Park West, Parkville",
        category: "Sports",
        description: "Morning yoga session for all skill levels in the beautiful Central Park.",
        fullDescription: "Start your weekend with peace and mindfulness at our community yoga session. All levels welcome - from beginners to experienced practitioners.\n\nWhat to bring:\n• Yoga mat (we have a few extras)\n• Water bottle\n• Comfortable clothing\n\nInstructor: Maria Gonzalez, certified yoga teacher with 10+ years experience.",
        image: "images/yoga-park.jpg",
        organizer: "Wellness Community",
        organizerEmail: "wellness@community.org",
        externalLink: "",
        status: "published",
        featured: false,
        price: "Donation-based"
    },
    {
        id: 4,
        title: "Food Festival 2024",
        date: "2024-01-25",
        time: "11:00",
        endDate: "2024-01-25",
        endTime: "19:00",
        location: "Riverside Park",
        address: "Riverside Drive, Cityville",
        category: "Food & Drink",
        description: "Annual food festival featuring local restaurants, food trucks, and culinary demonstrations.",
        fullDescription: "Experience the best of local cuisine at our annual food festival! Featuring:\n\n• 50+ local restaurants and food trucks\n• Live cooking demonstrations\n• Wine and beer tasting\n• Kids cooking classes\n• Live music throughout the day\n\nTickets include 5 food tasting tokens.",
        image: "images/food-festival.jpg",
        organizer: "City Food Association",
        organizerEmail: "info@cityfood.org",
        externalLink: "https://tickets.example.com/food-fest",
        status: "published",
        featured: true,
        price: "$35"
    },
    {
        id: 5,
        title: "Web Development Workshop",
        date: "2024-01-22",
        time: "14:00",
        endDate: "2024-01-22",
        endTime: "17:00",
        location: "Digital Skills Lab",
        address: "789 Tech Street, Learnville",
        category: "Workshop",
        description: "Hands-on workshop learning modern web development techniques.",
        fullDescription: "Learn to build responsive websites using HTML, CSS, and JavaScript in this intensive 3-hour workshop. Perfect for beginners!\n\nTopics covered:\n• HTML5 semantic structure\n• CSS Grid and Flexbox\n• Basic JavaScript interactivity\n• Responsive design principles\n\nAll materials provided. Bring your laptop.",
        image: "images/web-workshop.jpg",
        organizer: "Code Learning Center",
        organizerEmail: "workshops@codelearn.org",
        externalLink: "https://register.codelearn.org/web-dev",
        status: "published",
        featured: false,
        price: "$50"
    }
];

// Use the centralized event manager
const eventManager = window.eventManager;

// Current state
let currentEvents = [];
let currentView = 'grid';
let currentFilters = {
    date: 'all',
    category: 'all',
    search: '',
    sort: 'date-asc'
};

// Initialize events page
document.addEventListener('DOMContentLoaded', function() {
    initializeEventsPage();
});

function initializeEventsPage() {
    loadCategories();
    loadEvents();
    setupEventListeners();
}

function loadCategories() {
    const events = eventManager.getPublishedEvents();
    const categories = [...new Set(events.map(event => event.category))];
    const container = document.getElementById('categoryFilters');
    
    // Add "All Categories" button
    const allButton = document.createElement('button');
    allButton.className = 'filter-btn active';
    allButton.textContent = 'All Categories';
    allButton.setAttribute('data-filter', 'category');
    allButton.setAttribute('data-value', 'all');
    container.appendChild(allButton);
    
    // Add category buttons
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = category;
        button.setAttribute('data-filter', 'category');
        button.setAttribute('data-value', category.toLowerCase());
        container.appendChild(button);
    });
}

function loadEvents() {
    currentEvents = eventManager.getPublishedEvents();
    applyFilters();
    renderEvents();
}

// ... rest of the existing events.js code remains the same ...

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Sort select
    document.getElementById('sortSelect').addEventListener('change', handleSort);
    
    // View toggle buttons
    document.getElementById('gridView').addEventListener('click', () => switchView('grid'));
    document.getElementById('listView').addEventListener('click', () => switchView('list'));
    document.getElementById('calendarView').addEventListener('click', () => switchView('calendar'));
}

function handleFilterClick(e) {
    const filterType = this.getAttribute('data-filter');
    const filterValue = this.getAttribute('data-value');
    
    // Update active state
    document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(btn => {
        btn.classList.remove('active');
    });
    this.classList.add('active');
    
    // Update filters
    currentFilters[filterType] = filterValue;
    applyFilters();
    renderEvents();
}

function handleSearch(e) {
    currentFilters.search = e.target.value.toLowerCase();
    applyFilters();
    renderEvents();
}

function handleSort(e) {
    currentFilters.sort = e.target.value;
    applyFilters();
    renderEvents();
}

function applyFilters() {
    let filteredEvents = [...eventsData];
    
    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(currentFilters.date) {
        case 'week':
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today && eventDate <= nextWeek;
            });
            break;
        case 'month':
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today && eventDate <= nextMonth;
            });
            break;
        case 'past':
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate < today;
            });
            break;
        case 'all':
        default:
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today;
            });
    }
    
    // Category filter
    if (currentFilters.category !== 'all') {
        filteredEvents = filteredEvents.filter(event => 
            event.category.toLowerCase() === currentFilters.category
        );
    }
    
    // Search filter
    if (currentFilters.search) {
        filteredEvents = filteredEvents.filter(event =>
            event.title.toLowerCase().includes(currentFilters.search) ||
            event.description.toLowerCase().includes(currentFilters.search) ||
            event.location.toLowerCase().includes(currentFilters.search)
        );
    }
    
    // Sorting
    filteredEvents.sort((a, b) => {
        switch(currentFilters.sort) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'date-asc':
            default:
                return new Date(a.date) - new Date(b.date);
        }
    });
    
    currentEvents = filteredEvents;
}

function renderEvents() {
    const container = document.getElementById('eventsContainer');
    const calendarContainer = document.getElementById('calendarContainer');
    const noEventsMessage = document.getElementById('noEventsMessage');
    
    // Hide all containers first
    container.classList.add('hidden');
    calendarContainer.classList.add('hidden');
    noEventsMessage.classList.add('hidden');
    
    if (currentEvents.length === 0) {
        noEventsMessage.classList.remove('hidden');
        return;
    }
    
    if (currentView === 'calendar') {
        renderCalendarView();
        calendarContainer.classList.remove('hidden');
    } else {
        renderListView();
        container.classList.remove('hidden');
    }
}

function renderListView() {
    const container = document.getElementById('eventsContainer');
    
    // Set the correct class for view type
    container.className = currentView === 'grid' ? 'events-grid' : 'events-list';
    
    // Clear container
    container.innerHTML = '';
    
    currentEvents.forEach(event => {
        const eventElement = currentView === 'grid' ? createEventCard(event) : createEventListItem(event);
        container.appendChild(eventElement);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = `event-card category-${event.category.toLowerCase()}`;
    card.innerHTML = `
        <div class="event-image">
            ${event.image ? `<img src="${event.image}" alt="${event.title}" style="width:100%;height:100%;object-fit:cover;">` : 'Event Image'}
        </div>
        <div class="event-content">
            <div class="event-date">${formatDate(event.date)} at ${event.time}</div>
            <h3 class="event-title">${event.title}</h3>
            <div class="event-location">📍 ${event.location}</div>
            <div class="event-category">🏷️ ${event.category}</div>
            <div class="event-price">💰 ${event.price}</div>
            <p class="event-description">${event.description}</p>
            <a href="event-detail.html?id=${event.id}" class="event-link">View Details</a>
        </div>
    `;
    return card;
}

function createEventListItem(event) {
    const item = document.createElement('div');
    item.className = `event-list-item category-${event.category.toLowerCase()}`;
    item.innerHTML = `
        <div class="event-list-image">
            ${event.image ? `<img src="${event.image}" alt="${event.title}" style="width:100%;height:100%;object-fit:cover;">` : 'Event Image'}
        </div>
        <div class="event-list-content">
            <div class="event-date">${formatDate(event.date)} at ${event.time}</div>
            <h3 class="event-title">${event.title}</h3>
            <div class="event-location">📍 ${event.location}</div>
            <div class="event-meta">
                <span class="event-category">🏷️ ${event.category}</span>
                <span class="event-price">💰 ${event.price}</span>
            </div>
            <p class="event-description">${event.description}</p>
            <a href="event-detail.html?id=${event.id}" class="event-link">View Details</a>
        </div>
    `;
    return item;
}

function renderCalendarView() {
    const container = document.getElementById('calendarContainer');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    let calendarHTML = `
        <div class="calendar-header">
            <h3>${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        </div>
        <div class="calendar-grid">
    `;
    
    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarHTML += `<div class="calendar-day"></div>`;
    }
    
    // Days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = currentEvents.filter(event => event.date === dateStr);
        
        calendarHTML += `
            <div class="calendar-day">
                <div class="calendar-date">${day}</div>
                ${dayEvents.map(event => `
                    <div class="calendar-event" onclick="location.href='event-detail.html?id=${event.id}'">
                        ${event.time} - ${event.title}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    calendarHTML += `</div>`;
    container.innerHTML = calendarHTML;
}

function switchView(view) {
    currentView = view;
    
    // Update active view button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${view}View`).classList.add('active');
    
    renderEvents();
}

// Enhanced date formatting
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