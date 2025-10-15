// Centralized Event Management System
class EventManager {
    constructor() {
        this.storageKey = 'communityHubEvents';
        this.init();
    }

    init() {
        // Initialize with sample data if no events exist
        if (!this.getEvents().length) {
            this.initializeSampleEvents();
        }
    }

    // Get all events from localStorage
    getEvents() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch (error) {
            console.error('Error reading events from storage:', error);
            return [];
        }
    }

    // Save events to localStorage
    saveEvents(events) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(events));
            return true;
        } catch (error) {
            console.error('Error saving events to storage:', error);
            return false;
        }
    }

    // Get event by ID
    getEventById(id) {
        const events = this.getEvents();
        return events.find(event => event.id === parseInt(id));
    }

    // Get events by organizer ID
    getEventsByOrganizer(organizerId) {
        const events = this.getEvents();
        return events.filter(event => event.organizerId === organizerId);
    }

    // Get published events
    getPublishedEvents() {
        const events = this.getEvents();
        const today = new Date().toISOString().split('T')[0];
        
        return events.filter(event => 
            event.status === 'published' && 
            event.date >= today
        );
    }

    // Create new event
    createEvent(eventData) {
        const events = this.getEvents();
        const newEvent = {
            id: Date.now(), // Simple ID generation
            ...eventData,
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        events.push(newEvent);
        
        if (this.saveEvents(events)) {
            // Also update organizer's event list
            this.addEventToOrganizer(newEvent.organizerId, newEvent.id);
            return newEvent;
        }
        
        return null;
    }

    // Update existing event
    updateEvent(eventId, eventData) {
        const events = this.getEvents();
        const eventIndex = events.findIndex(event => event.id === eventId);
        
        if (eventIndex === -1) return null;

        events[eventIndex] = {
            ...events[eventIndex],
            ...eventData,
            updatedAt: new Date().toISOString()
        };

        if (this.saveEvents(events)) {
            return events[eventIndex];
        }
        
        return null;
    }

    // Delete event
    deleteEvent(eventId) {
        const events = this.getEvents();
        const eventIndex = events.findIndex(event => event.id === eventId);
        
        if (eventIndex === -1) return false;

        const deletedEvent = events[eventIndex];
        events.splice(eventIndex, 1);
        
        if (this.saveEvents(events)) {
            // Also remove from organizer's event list
            this.removeEventFromOrganizer(deletedEvent.organizerId, eventId);
            return true;
        }
        
        return false;
    }

    // Add event to organizer's event list
    addEventToOrganizer(organizerId, eventId) {
        const users = JSON.parse(localStorage.getItem('organizerUsers') || '[]');
        const userIndex = users.findIndex(user => user.id === organizerId);
        
        if (userIndex !== -1) {
            if (!users[userIndex].events) {
                users[userIndex].events = [];
            }
            users[userIndex].events.push(eventId);
            localStorage.setItem('organizerUsers', JSON.stringify(users));
        }
    }

    // Remove event from organizer's event list
    removeEventFromOrganizer(organizerId, eventId) {
        const users = JSON.parse(localStorage.getItem('organizerUsers') || '[]');
        const userIndex = users.findIndex(user => user.id === organizerId);
        
        if (userIndex !== -1 && users[userIndex].events) {
            users[userIndex].events = users[userIndex].events.filter(id => id !== eventId);
            localStorage.setItem('organizerUsers', JSON.stringify(users));
        }
    }

    // Increment event views
    incrementEventViews(eventId) {
        const events = this.getEvents();
        const eventIndex = events.findIndex(event => event.id === eventId);
        
        if (eventIndex !== -1) {
            events[eventIndex].views = (events[eventIndex].views || 0) + 1;
            this.saveEvents(events);
        }
    }

    // Initialize with sample events
    initializeSampleEvents() {
        const sampleEvents = [
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
                fullDescription: "Join us for an unforgettable evening of smooth jazz at the historic Downtown Music Hall. Our featured performers include the acclaimed City Jazz Quartet, along with special guest vocalist Sarah Johnson.",
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
            },
            {
                id: 2,
                title: "Startup Networking Mixer",
                date: "2024-02-18",
                time: "18:30",
                endDate: "2024-02-18",
                endTime: "21:00",
                location: "Tech Hub Center",
                address: "456 Innovation Drive, Techville",
                category: "Networking",
                description: "Connect with entrepreneurs, investors, and tech professionals.",
                fullDescription: "Our monthly startup networking mixer brings together the brightest minds in the tech community.",
                image: "images/networking.jpg",
                organizer: "Tech Community Group",
                organizerId: 2,
                organizerEmail: "events@techcommunity.org",
                website: "https://techcommunity.org",
                ticketLink: "https://meetup.com/tech-mixer",
                status: "published",
                price: "Free",
                views: 89,
                createdAt: "2024-01-05T09:15:00Z",
                updatedAt: "2024-01-12T16:45:00Z"
            },
            {
                id: 3,
                title: "Yoga in the Park",
                date: "2024-02-20",
                time: "08:00",
                endDate: "2024-02-20",
                endTime: "09:30",
                location: "Central Park",
                address: "Central Park West, Parkville",
                category: "Sports",
                description: "Morning yoga session for all skill levels in the beautiful Central Park.",
                fullDescription: "Start your weekend with peace and mindfulness at our community yoga session.",
                image: "images/yoga-park.jpg",
                organizer: "Wellness Community",
                organizerId: 1,
                organizerEmail: "wellness@community.org",
                status: "published",
                price: "Donation-based",
                views: 45,
                createdAt: "2024-01-08T11:20:00Z",
                updatedAt: "2024-01-08T11:20:00Z"
            },
            {
                id: 4,
                title: "Food Festival 2024",
                date: "2024-02-25",
                time: "11:00",
                endDate: "2024-02-25",
                endTime: "19:00",
                location: "Riverside Park",
                address: "Riverside Drive, Cityville",
                category: "Food & Drink",
                description: "Annual food festival featuring local restaurants, food trucks, and culinary demonstrations.",
                fullDescription: "Experience the best of local cuisine at our annual food festival!",
                image: "images/food-festival.jpg",
                organizer: "City Food Association",
                organizerId: 1,
                organizerEmail: "info@cityfood.org",
                website: "https://cityfood.org",
                ticketLink: "https://tickets.example.com/food-fest",
                status: "published",
                price: "$35",
                views: 234,
                createdAt: "2024-01-03T08:45:00Z",
                updatedAt: "2024-01-15T13:15:00Z"
            },
            {
                id: 5,
                title: "Web Development Workshop",
                date: "2024-02-22",
                time: "14:00",
                endDate: "2024-02-22",
                endTime: "17:00",
                location: "Digital Skills Lab",
                address: "789 Tech Street, Learnville",
                category: "Workshop",
                description: "Hands-on workshop learning modern web development techniques.",
                fullDescription: "Learn to build responsive websites using HTML, CSS, and JavaScript.",
                image: "images/web-workshop.jpg",
                organizer: "Code Learning Center",
                organizerId: 2,
                organizerEmail: "workshops@codelearn.org",
                website: "https://codelearn.org",
                ticketLink: "https://register.codelearn.org/web-dev",
                status: "draft",
                price: "$50",
                views: 0,
                createdAt: "2024-01-10T14:00:00Z",
                updatedAt: "2024-01-10T14:00:00Z"
            }
        ];

        this.saveEvents(sampleEvents);

        // Also initialize organizer users with their events
        const sampleUsers = [
            {
                id: 1,
                name: "City Arts Council",
                email: "arts@citycouncil.gov",
                password: "password123",
                orgType: "nonprofit",
                createdAt: new Date().toISOString(),
                events: [1, 3, 4] // Event IDs that this organizer owns
            },
            {
                id: 2,
                name: "Tech Community Group",
                email: "events@techcommunity.org",
                password: "password123",
                orgType: "community",
                createdAt: new Date().toISOString(),
                events: [2, 5]
            }
        ];

        localStorage.setItem('organizerUsers', JSON.stringify(sampleUsers));
    }
}

// Create global event manager instance
const eventManager = new EventManager();
window.eventManager = eventManager;