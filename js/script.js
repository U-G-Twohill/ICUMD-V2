// Handle immediate page state before DOM loads to prevent flashing
(function() {
    if (sessionStorage.getItem('isTransitioning') === 'true') {
        document.documentElement.classList.add('transitioning');
        const style = document.createElement('style');
        style.textContent = `
            .transitioning .header,
            .transitioning .container,
            .transitioning .footer,
            .transitioning .contact-section,
            .transitioning .modalBox,
            .transitioning .theme-selector {
                opacity: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }
})();

// Expanding Card JavaScript
class ExpandingCard {
    constructor(element) {
        this.card = element;
        this.trigger = this.card.querySelector('.expanding-card-trigger');
        this.closeBtn = this.card.querySelector('.expanding-card-close');
        this.content = this.card.querySelector('.expanding-card-content');
        this.overlay = document.getElementById('cardOverlay');
        this.isExpanded = false;
        this.isAnimating = false;
        this.originalPosition = null;

        // Check for required elements and log errors
        if (!this.trigger) {
            console.error(`ExpandingCard: Missing .expanding-card-trigger in card with ID ${this.card.dataset.cardId || 'unknown'}`);
            return;
        }
        if (!this.closeBtn) {
            console.error(`ExpandingCard: Missing .expanding-card-close in card with ID ${this.card.dataset.cardId || 'unknown'}`);
            return;
        }
        if (!this.content) {
            console.error(`ExpandingCard: Missing .expanding-card-content in card with ID ${this.card.dataset.cardId || 'unknown'}`);
            return;
        }
        if (!this.overlay) {
            console.error('ExpandingCard: Missing #cardOverlay element in the DOM');
            return;
        }

        this.init();
    }

    init() {
        // Log initialization for debugging
        console.log(`Initializing ExpandingCard with ID ${this.card.dataset.cardId || 'unknown'}`);

        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.isAnimating && !this.isExpanded) {
                console.log(`Trigger clicked for card ID ${this.card.dataset.cardId || 'unknown'}`);
                this.expand();
            }
        });

        // Ensure close button is clickable
        this.closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Close button clicked for card ID ${this.card.dataset.cardId || 'unknown'}`);
            if (!this.isAnimating && this.isExpanded) {
                this.collapse();
            }
        });

        // Only collapse if clicking outside the card
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay && !this.isAnimating && this.isExpanded) {
                console.log(`Overlay clicked for card ID ${this.card.dataset.cardId || 'unknown'}`);
                this.collapse();
            }
        });

        // Prevent clicks on content from closing the card
        this.content.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Content clicked for card ID ${this.card.dataset.cardId || 'unknown'}, preventing overlay close`);
        });

        // Prevent card hover effect when expanded
        this.card.addEventListener('mouseenter', () => {
            if (this.isExpanded) {
                this.card.querySelector('.card').style.transform = 'none';
            }
        });
    }

    expand() {
        if (this.isAnimating || this.isExpanded) return;
        
        this.isAnimating = true;
        this.isExpanded = true;
    
        // Disable page scrolling
        document.body.classList.add('card-expanded');
    
        // Store original position
        const rect = this.card.getBoundingClientRect();
        this.originalPosition = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        };
    
        // Clone card for smooth animation
        const cardClone = this.card.cloneNode(true);
        cardClone.style.position = 'fixed';
        cardClone.style.top = `${rect.top}px`;
        cardClone.style.left = `${rect.left}px`;
        cardClone.style.width = `${rect.width}px`;
        cardClone.style.height = `${rect.height}px`;
        cardClone.style.margin = '0';
        cardClone.style.zIndex = '1001';
        cardClone.classList.add('card-clone');
        document.body.appendChild(cardClone);
    
        // Hide original card
        this.card.style.opacity = '0';
    
        // Show overlay
        this.overlay.classList.add('active');
    
        // Calculate target dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const navbarHeight = getNavbarHeight();
        const topGap = 20; // Gap below navbar
        const bottomGap = 20; // Gap above bottom
        const availableHeight = viewportHeight - navbarHeight - topGap - bottomGap;
        const targetWidth = Math.min(viewportWidth * 0.9, 800);
    
        // Temporarily show content to measure full card height
        this.card.classList.add('is-expanded');
        this.card.style.position = 'fixed';
        this.card.style.width = `${targetWidth}px`;
        this.card.style.opacity = '0';
        this.card.style.top = '0px';
        this.content.style.display = 'block';
        const cardHeaderHeight = this.card.querySelector('.card-img').offsetHeight + this.card.querySelector('.card-body').offsetHeight; // Measure image + header
        const fullCardHeight = this.card.offsetHeight;
        this.card.style.opacity = '0';
        this.card.style.top = '';
        this.content.style.display = '';
    
        // Calculate target height with navbar and gaps
        const targetHeight = Math.min(fullCardHeight, availableHeight);
        const targetTop = navbarHeight + topGap + (availableHeight - targetHeight) / 2;
    
        // Set CSS custom property for navbar height
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
    
        // Animate clone to target position
        requestAnimationFrame(() => {
            cardClone.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            cardClone.style.top = `${targetTop}px`;
            cardClone.style.left = `${(viewportWidth - targetWidth) / 2}px`;
            cardClone.style.width = `${targetWidth}px`;
            cardClone.style.height = `${targetHeight}px`;
            
            // Set up the real expanded card
            this.card.style.position = 'fixed';
            this.card.style.top = `${targetTop}px`;
            this.card.style.left = `${(viewportWidth - targetWidth) / 2}px`;
            this.card.style.width = `${targetWidth}px`;
            this.card.style.height = 'auto';
            this.card.style.maxHeight = `${targetHeight}px`;
            this.card.style.overflow = 'hidden'; // Prevent content from spilling out
            
            this.content.style.display = 'block';
            this.content.style.maxHeight = `${targetHeight - cardHeaderHeight}px`; // Dynamic content height
            this.content.style.overflowY = 'auto'; // Scroll only the content
    
            setTimeout(() => {
                // Remove clone and show real card
                cardClone.remove();
                this.card.style.opacity = '1';
                this.card.classList.add('animate-in');
                
                // Log dimensions for debugging
                console.log(`Expanded card ID ${this.card.dataset.cardId || 'unknown'}: ` +
                    `Viewport height=${viewportHeight}px, ` +
                    `Full card height=${fullCardHeight}px, ` +
                    `Header height=${cardHeaderHeight}px, ` +
                    `Content height=${this.content.scrollHeight}px, ` +
                    `Card max-height=${targetHeight}px, ` +
                    `Available height=${availableHeight}px, ` +
                    `Navbar height=${navbarHeight}px, ` +
                    `Top gap=${topGap}px, ` +
                    `Bottom gap=${bottomGap}px, ` +
                    `Top position=${targetTop}px`);
                
                this.isAnimating = false;
                
                // Focus on close button for accessibility
                this.closeBtn.focus();
            }, 400);
        });
    }

    collapse() {
        if (this.isAnimating || !this.isExpanded) return;
        
        this.isAnimating = true;
        this.isExpanded = false;
    
        // Re-enable page scrolling
        document.body.classList.remove('card-expanded');
    
        // Hide content first
        this.card.classList.remove('animate-in');
        this.card.style.overflow = 'hidden';
    
        // Create collapsing clone
        const rect = this.card.getBoundingClientRect();
        const cardClone = this.card.cloneNode(true);
        cardClone.style.position = 'fixed';
        cardClone.style.top = `${rect.top}px`;
        cardClone.style.left = `${rect.left}px`;
        cardClone.style.width = `${rect.width}px`;
        cardClone.style.height = `${rect.height}px`;
        cardClone.style.margin = '0';
        cardClone.style.zIndex = '1001';
        cardClone.classList.add('card-clone');
        cardClone.querySelector('.expanding-card-content').style.display = 'none';
        cardClone.querySelector('.expanding-card-close').style.opacity = '0';
        document.body.appendChild(cardClone);
    
        // Hide original
        this.card.style.opacity = '0';
    
        // Animate back to original position
        requestAnimationFrame(() => {
            cardClone.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            cardClone.style.top = `${this.originalPosition.top}px`;
            cardClone.style.left = `${this.originalPosition.left}px`;
            cardClone.style.width = `${this.originalPosition.width}px`;
            cardClone.style.height = `${this.originalPosition.height}px`;
            
            // Hide overlay
            this.overlay.classList.remove('active');
            
            setTimeout(() => {
                // Reset card to original state
                this.card.classList.remove('is-expanded');
                this.card.style.position = '';
                this.card.style.top = '';
                this.card.style.left = '';
                this.card.style.width = '';
                this.card.style.height = '';
                this.card.style.maxHeight = '';
                this.card.style.overflow = '';
                this.card.style.opacity = '1';
                this.card.style.transform = ''; // Reset any transform from hover
                this.content.style.display = '';
                this.content.style.maxHeight = '';
                this.content.style.overflowY = '';
                
                // Remove clone
                cardClone.remove();
                
                // Force reflow to fix layout
                this.card.offsetHeight; // Trigger reflow
                
                this.isAnimating = false;
                
                // Return focus to trigger
                this.trigger.focus();
            }, 400);
        });
    }
}

// Wait for DOM to be fully loaded before running script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all expanding cards
    const cards = document.querySelectorAll('.expanding-card');
    if (cards.length === 0) {
        console.warn('No .expanding-card elements found in the DOM');
    }
    cards.forEach(card => {
        new ExpandingCard(card);
        console.log(`Found expanding card with ID ${card.dataset.cardId || 'unknown'}`);
    });

    // Handle escape key for expanding cards
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const expandedCard = document.querySelector('.expanding-card.is-expanded');
            if (expandedCard) {
                const closeBtn = expandedCard.querySelector('.expanding-card-close');
                console.log('Escape key pressed, triggering close button');
                closeBtn.click();
            }
        }
    });

    // Get reference to the navigation bar
    const navbar = document.querySelector('.page-navbar');
    
    // Listen for scroll events and update navbar state
    window.addEventListener('scroll', function() {
        sessionStorage.setItem('scrollPosition', window.scrollY);
        sessionStorage.setItem('wasAffixed', window.scrollY > 100);
        updateNavbar();
    });

    // Function to update navbar appearance based on scroll position
    function updateNavbar() {
        if (window.scrollY > 100) {
            navbar.classList.add('affix');
        } else {
            navbar.classList.remove('affix');
        }
    }

    // Initialize navbar state
    updateNavbar();

    // Mobile Menu Functionality
    initMobileMenu();
    
    // Page transition functionality
    initPageTransitions();
    
    // Handle page load fade in
    handlePageLoadFadeIn();

    // Initialize smooth scroll with navbar offset
    initSmoothScrollWithOffset();
});

// Function to initialize mobile menu
function initMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navBar = document.querySelector('.nav-navbar');
    const dropdownItems = document.querySelectorAll('.dropdown-submenu > .dropdown-item');
    
    if (!hamburgerBtn || !navBar) return;
    
    // Toggle mobile menu
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        navBar.classList.toggle('show-mobile-menu');
        document.body.classList.toggle('mobile-menu-open');
    });
    
    // Handle mobile dropdown toggles
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                const submenu = this.nextElementSibling;
                const parent = this.parentElement;
                
                // Close other submenus
                document.querySelectorAll('.dropdown-submenu').forEach(sub => {
                    if (sub !== parent) {
                        sub.classList.remove('active');
                    }
                });
                
                // Toggle current submenu
                parent.classList.toggle('active');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-navbar') && !e.target.closest('.hamburger-btn')) {
            hamburgerBtn.classList.remove('active');
            navBar.classList.remove('show-mobile-menu');
            document.body.classList.remove('mobile-menu-open');
            
            // Close all submenus
            document.querySelectorAll('.dropdown-submenu').forEach(sub => {
                sub.classList.remove('active');
            });
        }
    });
    
    // Close menu when clicking on a link (except dropdown toggles)
    document.querySelectorAll('.nav-link:not(.dropdown-item)').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                hamburgerBtn.classList.remove('active');
                navBar.classList.remove('show-mobile-menu');
                document.body.classList.remove('mobile-menu-open');
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            hamburgerBtn.classList.remove('active');
            navBar.classList.remove('show-mobile-menu');
            document.body.classList.remove('mobile-menu-open');
            document.querySelectorAll('.dropdown-submenu').forEach(sub => {
                sub.classList.remove('active');
            });
        }
    });
}

// Function to initialize page transitions
function initPageTransitions() {
    const allLinks = document.querySelectorAll('a[href]');
    
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's a same-page anchor link
            if (href && href.startsWith('#')) {
                return;
            }
            
            // Check if it's an internal page link
            if (href && 
                href.includes('.html') && 
                !href.startsWith('http') && 
                !href.startsWith('javascript:') &&
                !href.startsWith('mailto:') &&
                !href.startsWith('tel:')) {
                
                const targetPage = href.split('#')[0];
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                
                if (targetPage === currentPage || targetPage === `./${currentPage}`) {
                    return;
                }
                
                e.preventDefault();
                handlePageTransition(href);
            }
        });
    });
}

// Function to handle page transitions
function handlePageTransition(targetUrl) {
    const body = document.body;
    const currentScrollY = window.scrollY;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const targetPage = targetUrl.split('/').pop();
    
    if (currentPage === targetPage) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        return;
    }
    
    if (currentScrollY > 0) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            startFadeTransition(targetUrl);
        }, 800);
    } else {
        startFadeTransition(targetUrl);
    }
}

// Function to start fade transition
function startFadeTransition(targetUrl) {
    const body = document.body;
    
    body.classList.add('page-fade-out');
    
    sessionStorage.setItem('isTransitioning', 'true');
    sessionStorage.setItem('transitionTarget', targetUrl);
    
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 300);
}

// Function to handle page load fade in
function handlePageLoadFadeIn() {
    const body = document.body;
    const html = document.documentElement;
    const isTransitioning = sessionStorage.getItem('isTransitioning') === 'true';
    
    if (isTransitioning) {
        html.classList.remove('transitioning');
        body.classList.add('page-fade-in');
        
        sessionStorage.removeItem('isTransitioning');
        sessionStorage.removeItem('transitionTarget');
        
        setTimeout(() => {
            body.classList.remove('page-fade-in');
        }, 300);
    }
}

// Function to get navbar height
function getNavbarHeight() {
    const navbar = document.querySelector('.page-navbar');
    if (!navbar) return 0;
    
    if (navbar.classList.contains('affix')) {
        return 70;
    } else {
        return 110;
    }
}

// Function to initialize smooth scroll
function initSmoothScrollWithOffset() {
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a[href]');
        if (!target) return;
        
        const href = target.getAttribute('href');
        if (!href) return;
        
        let hash = '';
        let shouldScroll = false;
        
        if (href.startsWith('#')) {
            hash = href;
            shouldScroll = true;
        } else if (href.includes('#')) {
            const parts = href.split('#');
            const targetPage = parts[0];
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            if (targetPage === currentPage || targetPage === `./${currentPage}`) {
                hash = '#' + parts[1];
                shouldScroll = true;
            } else {
                return;
            }
        } else if (href.includes('.html')) {
            const targetPage = href;
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            if (targetPage === currentPage || targetPage === `./${currentPage}`) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            } else {
                return;
            }
        } else {
            return;
        }
        
        if (!shouldScroll || !hash || hash === '#') return;
        
        const targetElement = document.querySelector(hash);
        if (!targetElement) return;
        
        e.preventDefault();
        
        const navbarHeight = getNavbarHeight();
        const targetPosition = targetElement.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            history.pushState(null, null, hash);
        }, 700);
    });

    // Handle cross-page anchors
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                const navbarHeight = getNavbarHeight();
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
}

// jQuery functionality (only if jQuery is loaded)
if (typeof jQuery !== 'undefined') {
    $(document).ready(function(){
        $('.search-toggle').click(function(){
            $('.search-wrapper').toggleClass('show');
        });

        $('.modal-toggle').click(function(){
            $('.modalBox').toggleClass('show');
        });

        $('.modalBox').click(function(){
            $(this).removeClass('show');
        });

        $('.spinner').click(function(){
            $(".theme-selector").toggleClass('show');
        });

        $('.light').click(function(){
            $('body').addClass('light-theme');
            $('body').removeClass('dark-theme');
        });

        $('.dark').click(function(){
            $('body').toggleClass('dark-theme');
            $('body').removeClass('light-theme');
        });
    });
}