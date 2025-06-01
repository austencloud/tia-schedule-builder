// TIA Schedule Builder - Navigation Module
// Manages smooth scrolling navigation and section highlighting

export class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        this.currentSection = 'summary';
        
        this.setupEventListeners();
        this.setupIntersectionObserver();
    }
    
    setupEventListeners() {
        // Handle navigation clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Only handle internal links (not external ones like detailed-analysis.html)
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    this.navigateToSection(targetId);
                }
            });
        });
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToSection('summary');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToSection('table');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateToSection('calendar');
                        break;
                    case '4':
                        e.preventDefault();
                        this.navigateToSection('insights');
                        break;
                }
            }
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.navigateToSection(e.state.section, false);
            }
        });
        
        // Handle scroll to top
        this.addScrollToTopButton();
    }
    
    setupIntersectionObserver() {
        // Create intersection observer to highlight current section
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.updateActiveNavLink(sectionId);
                }
            });
        }, observerOptions);
        
        // Observe all sections
        this.sections.forEach(section => {
            if (section.id) {
                observer.observe(section);
            }
        });
    }
    
    navigateToSection(sectionId, updateHistory = true) {
        const targetElement = document.getElementById(sectionId);
        
        if (!targetElement) {
            console.warn(`Section with id "${sectionId}" not found`);
            return;
        }
        
        // Smooth scroll to section
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Update active nav link
        this.updateActiveNavLink(sectionId);
        
        // Update browser history
        if (updateHistory) {
            const newUrl = `${window.location.pathname}#${sectionId}`;
            history.pushState({ section: sectionId }, '', newUrl);
        }
        
        // Update current section
        this.currentSection = sectionId;
        
        // Trigger section change event
        this.triggerSectionChangeEvent(sectionId);
    }
    
    updateActiveNavLink(sectionId) {
        // Remove active class from all nav links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current section's nav link
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    addScrollToTopButton() {
        // Create scroll to top button
        const scrollButton = document.createElement('button');
        scrollButton.className = 'scroll-to-top';
        scrollButton.innerHTML = '↑';
        scrollButton.title = 'Scroll to top';
        scrollButton.setAttribute('aria-label', 'Scroll to top');
        
        // Add styles
        Object.assign(scrollButton.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3498db, #2980b9)',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '999',
            opacity: '0',
            visibility: 'hidden',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        
        // Add hover effects
        scrollButton.addEventListener('mouseenter', () => {
            scrollButton.style.transform = 'scale(1.1)';
            scrollButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
        });
        
        scrollButton.addEventListener('mouseleave', () => {
            scrollButton.style.transform = 'scale(1)';
            scrollButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        // Add click handler
        scrollButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollButton.style.opacity = '1';
                scrollButton.style.visibility = 'visible';
            } else {
                scrollButton.style.opacity = '0';
                scrollButton.style.visibility = 'hidden';
            }
        });
        
        document.body.appendChild(scrollButton);
    }
    
    triggerSectionChangeEvent(sectionId) {
        // Dispatch custom event for section changes
        const event = new CustomEvent('sectionChange', {
            detail: {
                section: sectionId,
                previousSection: this.currentSection
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // Method to get current section
    getCurrentSection() {
        return this.currentSection;
    }
    
    // Method to navigate to next section
    navigateToNext() {
        const sectionIds = ['summary', 'table', 'calendar', 'insights'];
        const currentIndex = sectionIds.indexOf(this.currentSection);
        
        if (currentIndex < sectionIds.length - 1) {
            this.navigateToSection(sectionIds[currentIndex + 1]);
        }
    }
    
    // Method to navigate to previous section
    navigateToPrevious() {
        const sectionIds = ['summary', 'table', 'calendar', 'insights'];
        const currentIndex = sectionIds.indexOf(this.currentSection);
        
        if (currentIndex > 0) {
            this.navigateToSection(sectionIds[currentIndex - 1]);
        }
    }
    
    // Method to add breadcrumb navigation
    addBreadcrumbs() {
        const breadcrumbContainer = document.createElement('div');
        breadcrumbContainer.className = 'breadcrumbs';
        breadcrumbContainer.innerHTML = `
            <div class="breadcrumb-item">
                <a href="#summary">Summary</a>
            </div>
            <div class="breadcrumb-separator">›</div>
            <div class="breadcrumb-item">
                <a href="#table">Staff Table</a>
            </div>
            <div class="breadcrumb-separator">›</div>
            <div class="breadcrumb-item">
                <a href="#calendar">Calendar</a>
            </div>
            <div class="breadcrumb-separator">›</div>
            <div class="breadcrumb-item">
                <a href="#insights">Insights</a>
            </div>
        `;
        
        // Add styles
        Object.assign(breadcrumbContainer.style, {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 30px',
            background: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            fontSize: '0.9em'
        });
        
        // Insert after navigation
        const navigation = document.querySelector('.navigation');
        if (navigation) {
            navigation.insertAdjacentElement('afterend', breadcrumbContainer);
        }
    }
    
    // Method to highlight sections during scroll
    highlightSectionOnScroll() {
        const sections = document.querySelectorAll('.section');
        
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            if (current && current !== this.currentSection) {
                this.updateActiveNavLink(current);
                this.currentSection = current;
            }
        });
    }
    
    // Initialize navigation on page load
    init() {
        // Check for hash in URL on page load
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            setTimeout(() => {
                this.navigateToSection(hash, false);
            }, 100);
        }
        
        // Add keyboard shortcuts info
        this.addKeyboardShortcutsInfo();
    }
    
    addKeyboardShortcutsInfo() {
        // Add a small info tooltip about keyboard shortcuts
        const infoButton = document.createElement('button');
        infoButton.innerHTML = '⌨️';
        infoButton.title = 'Keyboard shortcuts: Ctrl+1-4 to navigate sections';
        infoButton.className = 'keyboard-shortcuts-info';
        
        Object.assign(infoButton.style, {
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(52, 73, 94, 0.8)',
            color: 'white',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            zIndex: '998',
            opacity: '0.7',
            transition: 'opacity 0.3s ease'
        });
        
        infoButton.addEventListener('mouseenter', () => {
            infoButton.style.opacity = '1';
        });
        
        infoButton.addEventListener('mouseleave', () => {
            infoButton.style.opacity = '0.7';
        });
        
        document.body.appendChild(infoButton);
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new Navigation();
    navigation.init();
});
