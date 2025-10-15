// Event Creation/Edit System
class EventCreator {
    constructor() {
        this.currentEvent = null;
        this.isEditing = false;
        this.map = null;
        this.mapMarker = null;
        this.eventManager = window.eventManager;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.checkEditMode();
        this.setupEventListeners();
        this.initializeForm();
        this.setupRealTimePreview();
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

    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('edit');
        
        if (eventId) {
            this.isEditing = true;
            this.loadEventForEditing(parseInt(eventId));
        }
    }

    loadEventForEditing(eventId) {
        this.currentEvent = this.eventManager.getEventById(eventId);
        
        if (this.currentEvent && this.currentUser.events.includes(eventId)) {
            this.populateForm();
            document.getElementById('pageTitle').textContent = 'Edit Event';
            document.getElementById('submitButtonText').textContent = 'Update Event';
        } else {
            alert('Event not found or you do not have permission to edit it.');
            window.location.href = 'organizer-dashboard.html';
        }
    }

    populateForm() {
        if (!this.currentEvent) return;

        // Basic Information
        document.getElementById('eventTitle').value = this.currentEvent.title;
        document.getElementById('eventCategory').value = this.currentEvent.category;
        document.getElementById('eventPrice').value = this.getPriceType(this.currentEvent.price);
        
        // Set price amount if it's a paid event
        if (this.currentEvent.price && this.currentEvent.price.startsWith('$')) {
            const priceAmount = this.currentEvent.price.replace('$', '');
            document.getElementById('priceAmount').value = priceAmount;
        }

        // Date & Time
        document.getElementById('eventDate').value = this.currentEvent.date;
        document.getElementById('eventTime').value = this.currentEvent.time;
        
        if (this.currentEvent.endDate) {
            document.getElementById('eventEndDate').value = this.currentEvent.endDate;
        }
        if (this.currentEvent.endTime) {
            document.getElementById('eventEndTime').value = this.currentEvent.endTime;
        }

        // Location
        document.getElementById('eventLocation').value = this.currentEvent.location;
        if (this.currentEvent.address) {
            document.getElementById('eventAddress').value = this.currentEvent.address;
            setTimeout(() => this.updateMapPreview(), 500);
        }

        // Description
        document.getElementById('eventDescription').value = this.currentEvent.description;
        if (this.currentEvent.fullDescription) {
            document.getElementById('eventFullDescription').value = this.currentEvent.fullDescription;
        }

        // External Links
        if (this.currentEvent.website) {
            document.getElementById('eventWebsite').value = this.currentEvent.website;
        }
        if (this.currentEvent.ticketLink) {
            document.getElementById('eventTicketLink').value = this.currentEvent.ticketLink;
        }
        if (this.currentEvent.socialLink) {
            document.getElementById('eventSocialLink').value = this.currentEvent.socialLink;
        }

        // Status
        document.getElementById('eventStatus').value = this.currentEvent.status;

        // Image (simulated - in real app, you'd handle file uploads)
        if (this.currentEvent.image) {
            this.showImagePreview(this.currentEvent.image);
        }

        this.updateCharCount();
        this.handlePriceTypeChange(this.getPriceType(this.currentEvent.price));
    }

    getPriceType(price) {
        if (price === 'Free') return 'Free';
        if (price === 'Donation-based') return 'Donation-based';
        if (price && price.startsWith('$')) return 'Paid';
        return 'Free';
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Save draft button
        document.getElementById('saveDraft').addEventListener('click', () => {
            document.getElementById('eventStatus').value = 'draft';
            document.getElementById('eventForm').requestSubmit();
        });

        // Preview button
        document.getElementById('previewEvent').addEventListener('click', () => {
            this.showPreview();
        });

        // Close preview
        document.getElementById('closePreview').addEventListener('click', () => {
            this.closePreview();
        });

        // Image upload
        document.getElementById('imageUploadArea').addEventListener('click', () => {
            document.getElementById('eventImage').click();
        });

        document.getElementById('eventImage').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        document.getElementById('removeImage').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage();
        });

        // Price type change
        document.getElementById('eventPrice').addEventListener('change', (e) => {
            this.handlePriceTypeChange(e.target.value);
        });

        // Recurring event
        document.getElementById('isRecurring').addEventListener('change', (e) => {
            document.getElementById('recurringOptions').style.display = 
                e.target.checked ? 'block' : 'none';
        });

        // Map location
        document.getElementById('locateOnMap').addEventListener('click', () => {
            this.updateMapPreview();
        });

        // Character count
        document.getElementById('eventDescription').addEventListener('input', () => {
            this.updateCharCount();
        });

        // Logout
        document.getElementById('logoutButton').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    initializeForm() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('eventDate').min = today;
        document.getElementById('eventEndDate').min = today;

        // Initialize price field
        this.handlePriceTypeChange(document.getElementById('eventPrice').value);
    }

    setupRealTimePreview() {
        // Update preview on form changes
        const previewFields = [
            'eventTitle', 'eventCategory', 'eventDate', 'eventTime', 
            'eventLocation', 'eventPrice', 'eventDescription'
        ];

        previewFields.forEach(fieldId => {
            document.getElementById(fieldId).addEventListener('input', () => {
                this.updateSidebarPreview();
            });
        });

        // Initial preview update
        this.updateSidebarPreview();
    }

    updateSidebarPreview() {
        document.getElementById('previewCategory').textContent = 
            document.getElementById('eventCategory').value || '-';
        
        const date = document.getElementById('eventDate').value;
        document.getElementById('previewDate').textContent = 
            date ? this.formatDisplayDate(date) : '-';
        
        document.getElementById('previewTime').textContent = 
            document.getElementById('eventTime').value || '-';
        
        document.getElementById('previewLocation').textContent = 
            document.getElementById('eventLocation').value || '-';
        
        const priceType = document.getElementById('eventPrice').value;
        let priceText = priceType || '-';
        if (priceType === 'Paid' && document.getElementById('priceAmount').value) {
            priceText = `$${document.getElementById('priceAmount').value}`;
        }
        document.getElementById('previewPrice').textContent = priceText;
    }

    handlePriceTypeChange(priceType) {
        const priceAmountGroup = document.getElementById('priceAmountGroup');
        const priceAmountInput = document.getElementById('priceAmount');
        
        if (priceType === 'Paid') {
            priceAmountGroup.style.display = 'block';
            priceAmountInput.required = true;
        } else {
            priceAmountGroup.style.display = 'none';
            priceAmountInput.required = false;
            priceAmountInput.value = '';
        }
        this.updateSidebarPreview();
    }

    handleImageUpload(file) {
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Image size must be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.showImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    showImagePreview(imageUrl) {
        document.getElementById('previewImage').src = imageUrl;
        document.getElementById('imagePreview').style.display = 'block';
        document.querySelector('.upload-placeholder').style.display = 'none';
    }

    removeImage() {
        document.getElementById('eventImage').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        document.querySelector('.upload-placeholder').style.display = 'block';
    }

    updateMapPreview() {
        const address = document.getElementById('eventAddress').value;
        if (!address) {
            document.getElementById('locationMap').innerHTML = 
                '<div class="map-placeholder">Enter address to see map preview</div>';
            return;
        }

        // For demo purposes, we'll use a default location
        const defaultCoords = [40.7128, -74.0060]; // New York
        
        try {
            if (!this.map) {
                this.map = L.map('locationMap').setView(defaultCoords, 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(this.map);
            }

            if (this.mapMarker) {
                this.map.removeLayer(this.mapMarker);
            }

            this.mapMarker = L.marker(defaultCoords)
                .addTo(this.map)
                .bindPopup(address)
                .openPopup();

            this.map.setView(defaultCoords, 15);

        } catch (error) {
            console.error('Error initializing map:', error);
            document.getElementById('locationMap').innerHTML = 
                '<div class="map-placeholder">Map unavailable</div>';
        }
    }

    updateCharCount() {
        const textarea = document.getElementById('eventDescription');
        const counter = document.getElementById('descCharCount');
        counter.textContent = textarea.value.length;
    }

    async handleFormSubmit() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        // Show loading state
        const submitButton = document.querySelector('#eventForm button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="loading-spinner">⏳</span> Saving...';
        submitButton.disabled = true;

        try {
            // Simulate API call
            await this.simulateAPICall(1000);
            
            let result;
            if (this.isEditing) {
                result = this.updateEvent(formData);
            } else {
                result = this.createEvent(formData);
            }
            
            if (result) {
                this.showNotification(
                    `Event ${this.isEditing ? 'updated' : 'created'} successfully!`, 
                    'success'
                );
                
                // Redirect to dashboard after success
                setTimeout(() => {
                    window.location.href = 'organizer-dashboard.html';
                }, 1500);
            } else {
                throw new Error('Save failed');
            }
            
        } catch (error) {
            this.showNotification(
                `Failed to ${this.isEditing ? 'update' : 'create'} event. Please try again.`,
                'error'
            );
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    getFormData() {
        const form = document.getElementById('eventForm');
        const formData = new FormData(form);
        
        // Format the price
        let price = formData.get('price');
        if (price === 'Paid' && formData.get('priceAmount')) {
            price = `$${formData.get('priceAmount')}`;
        }

        return {
            title: formData.get('title'),
            category: formData.get('category'),
            price: price,
            date: formData.get('date'),
            time: formData.get('time'),
            endDate: formData.get('endDate'),
            endTime: formData.get('endTime'),
            location: formData.get('location'),
            address: formData.get('address'),
            description: formData.get('description'),
            fullDescription: formData.get('fullDescription'),
            website: formData.get('website'),
            ticketLink: formData.get('ticketLink'),
            socialLink: formData.get('socialLink'),
            status: formData.get('status'),
            organizer: this.currentUser.name,
            organizerId: this.currentUser.id,
            organizerEmail: this.currentUser.email,
            image: this.currentEvent?.image || 'images/event-default.jpg' // Default image
        };
    }

    validateForm(data) {
        // Required fields
        if (!data.title?.trim()) {
            this.showFieldError('eventTitle', 'Event title is required');
            return false;
        }

        if (!data.category) {
            this.showFieldError('eventCategory', 'Please select a category');
            return false;
        }

        if (!data.date) {
            this.showFieldError('eventDate', 'Event date is required');
            return false;
        }

        if (!data.time) {
            this.showFieldError('eventTime', 'Event time is required');
            return false;
        }

        if (!data.location?.trim()) {
            this.showFieldError('eventLocation', 'Venue name is required');
            return false;
        }

        if (!data.address?.trim()) {
            this.showFieldError('eventAddress', 'Full address is required');
            return false;
        }

        if (!data.description?.trim()) {
            this.showFieldError('eventDescription', 'Short description is required');
            return false;
        }

        // Date validation
        const eventDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            this.showFieldError('eventDate', 'Event date cannot be in the past');
            return false;
        }

        // End date validation
        if (data.endDate && data.endTime) {
            const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
            const startDateTime = new Date(`${data.date}T${data.time}`);
            
            if (endDateTime <= startDateTime) {
                this.showFieldError('eventEndDate', 'End date/time must be after start date/time');
                return false;
            }
        }

        return true;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const existingError = field.parentNode.querySelector('.field-error');
        
        if (existingError) {
            existingError.remove();
        }

        field.style.borderColor = '#e74c3c';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 0.25rem;';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
        field.focus();

        // Remove error on input
        const removeError = () => {
            field.style.borderColor = '#e9ecef';
            errorDiv.remove();
            field.removeEventListener('input', removeError);
        };
        field.addEventListener('input', removeError);
    }

    createEvent(formData) {
        return this.eventManager.createEvent(formData);
    }

    updateEvent(formData) {
        return this.eventManager.updateEvent(this.currentEvent.id, formData);
    }

    showPreview() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        const previewContent = this.generatePreviewContent(formData);
        document.getElementById('eventPreviewContent').innerHTML = previewContent;
        document.getElementById('previewModal').classList.remove('hidden');
    }

    closePreview() {
        document.getElementById('previewModal').classList.add('hidden');
    }

    generatePreviewContent(formData) {
        return `
            <div class="event-preview">
                <div class="preview-header">
                    <h2>${formData.title}</h2>
                    <div class="preview-meta">
                        <span class="category-badge">${formData.category}</span>
                        <span class="price-badge">${formData.price}</span>
                    </div>
                </div>
                
                <div class="preview-section">
                    <h3>Date & Time</h3>
                    <p>${this.formatDisplayDate(formData.date)} at ${formData.time}</p>
                    ${formData.endDate && formData.endTime ? 
                        `<p>Ends: ${this.formatDisplayDate(formData.endDate)} at ${formData.endTime}</p>` : ''}
                </div>
                
                <div class="preview-section">
                    <h3>Location</h3>
                    <p><strong>${formData.location}</strong></p>
                    <p>${formData.address}</p>
                </div>
                
                <div class="preview-section">
                    <h3>Description</h3>
                    <p>${formData.description}</p>
                    ${formData.fullDescription ? 
                        `<div class="full-description">${formData.fullDescription.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
                
                ${formData.website || formData.ticketLink ? `
                <div class="preview-section">
                    <h3>Links</h3>
                    ${formData.website ? `<p>Website: <a href="${formData.website}" target="_blank">${formData.website}</a></p>` : ''}
                    ${formData.ticketLink ? `<p>Tickets: <a href="${formData.ticketLink}" target="_blank">${formData.ticketLink}</a></p>` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }

    formatDisplayDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'organizer-login.html';
    }

    showNotification(message, type = 'success') {
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
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    simulateAPICall(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }
}

// Initialize event creator when page loads
const eventCreator = new EventCreator();