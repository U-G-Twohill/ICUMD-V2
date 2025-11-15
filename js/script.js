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

        // Check for required elements
        if (!this.trigger || !this.closeBtn || !this.content || !this.overlay) {
            console.error(`ExpandingCard: Missing required elements in card with ID ${this.card.dataset.cardId || 'unknown'}`);
            return;
        }

        this.init();
    }

    init() {
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.isAnimating && !this.isExpanded) {
                this.expand();
            }
        });

        this.closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.isAnimating && this.isExpanded) {
                this.collapse();
            }
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay && !this.isAnimating && this.isExpanded) {
                this.collapse();
            }
        });

        this.content.addEventListener('click', (e) => {
            e.stopPropagation();
        });

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
    
        // Compensate for scrollbar before disabling scroll
        this.compensateForScrollbar();
        
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
        
        // Fade out paragraph text in the clone
        const cloneParagraphs = cardClone.querySelectorAll('.card-body p');
        cloneParagraphs.forEach(p => {
            p.style.transition = 'opacity 0.2s ease-out';
            p.style.opacity = '1';
        });
        
        document.body.appendChild(cardClone);
    
        // Hide original card
        this.card.style.opacity = '0';
    
        // Show overlay
        this.overlay.classList.add('active');
    
        // Calculate target dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const navbarHeight = getNavbarHeight();
        const topGap = 20;
        const bottomGap = 20;
        const availableHeight = viewportHeight - navbarHeight - topGap - bottomGap;
        const targetWidth = Math.min(viewportWidth * 0.9, 800);
    
        // Temporarily show content to measure full card height
        this.card.classList.add('is-expanded');
        this.card.style.position = 'fixed';
        this.card.style.width = `${targetWidth}px`;
        this.card.style.opacity = '0';
        this.card.style.top = '0px';
        this.content.style.display = 'block';
        const cardHeaderHeight = this.card.querySelector('.card-img').offsetHeight + this.card.querySelector('.card-body').offsetHeight;
        const fullCardHeight = this.card.offsetHeight;
        this.card.style.opacity = '0';
        this.card.style.top = '';
        this.content.style.display = '';
    
        // Calculate target height and position
        const targetHeight = Math.min(fullCardHeight, availableHeight);
        const targetTop = navbarHeight + topGap + (availableHeight - targetHeight) / 2;
    
        // Set CSS custom property for navbar height
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
    
        // Start animation sequence
        requestAnimationFrame(() => {
            cloneParagraphs.forEach(p => {
                p.style.opacity = '0';
            });
            
            setTimeout(() => {
                // Animate clone to target position
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
                this.card.style.overflow = 'hidden';
                
                // Initially hide paragraph text
                const realParagraphs = this.card.querySelectorAll('.card-body p');
                realParagraphs.forEach(p => {
                    p.style.opacity = '0';
                    p.style.transition = 'opacity 0.3s ease-in';
                });
                
                this.content.style.display = 'block';
                this.content.style.maxHeight = `${targetHeight - cardHeaderHeight}px`;
                this.content.style.overflowY = 'auto';
    
                setTimeout(() => {
                    // Remove clone and show real card
                    cardClone.remove();
                    this.card.style.opacity = '1';
                    this.card.classList.add('animate-in');
                    
                    // Fade in paragraph text
                    setTimeout(() => {
                        realParagraphs.forEach(p => {
                            p.style.opacity = '1';
                        });
                    }, 50);
                    
                    this.isAnimating = false;
                    this.closeBtn.focus();
                }, 400);
            }, 200);
        });
    }

    collapse() {
        if (this.isAnimating || !this.isExpanded) return;
        
        this.isAnimating = true;
        this.isExpanded = false;
    
        // Re-enable page scrolling and remove scrollbar compensation
        this.removeScrollbarCompensation();
        document.body.classList.remove('card-expanded');
    
        // Trigger fade-out animation
        this.card.classList.remove('animate-in');
        this.card.classList.add('animate-out');
        
        // Fade out paragraph text
        const paragraphs = this.card.querySelectorAll('.card-body p');
        paragraphs.forEach(p => {
            p.style.transition = 'opacity 0.2s ease-out';
            p.style.opacity = '0';
        });
        
        // Force reflow
        this.card.offsetHeight;
        
        // Wait for content fade-out animation
        setTimeout(() => {
            // Ensure all animations have settled before measuring
            this.card.style.overflow = 'hidden';
            
            // Force a reflow to ensure stable positioning
            this.card.offsetHeight;
            
            // Get position after reflow
            const rect = this.card.getBoundingClientRect();
            
            // Validate that we have a reasonable position
            if (rect.width <= 0 || rect.height <= 0 || rect.top < 0) {
                console.warn('Invalid card position detected, skipping transform animation');
                // Fallback: just reset the card directly
                this.resetCardToOriginal();
                return;
            }
            
            const cardClone = this.card.cloneNode(true);
            cardClone.style.position = 'fixed';
            cardClone.style.top = `${rect.top}px`;
            cardClone.style.left = `${rect.left}px`;
            cardClone.style.width = `${rect.width}px`;
            cardClone.style.height = `${rect.height}px`;
            cardClone.style.margin = '0';
            cardClone.style.zIndex = '1001';
            cardClone.classList.add('card-clone');
            
            // Hide expanded content in clone
            const cloneContent = cardClone.querySelector('.expanding-card-content');
            if (cloneContent) {
                cloneContent.style.opacity = '0';
                cloneContent.style.display = 'none';
            }
            cardClone.querySelector('.expanding-card-close').style.opacity = '0';
            
            // Hide paragraph text in clone
            const cloneParagraphs = cardClone.querySelectorAll('.card-body p');
            cloneParagraphs.forEach(p => {
                p.style.opacity = '0';
            });
            
            document.body.appendChild(cardClone);
            this.card.style.opacity = '0';
        
            // Animate back to original position
            requestAnimationFrame(() => {
                cardClone.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                cardClone.style.top = `${this.originalPosition.top}px`;
                cardClone.style.left = `${this.originalPosition.left}px`;
                cardClone.style.width = `${this.originalPosition.width}px`;
                cardClone.style.height = `${this.originalPosition.height}px`;
                
                // Fade in paragraph text during collapse
                setTimeout(() => {
                    cloneParagraphs.forEach(p => {
                        p.style.transition = 'opacity 0.3s ease-in';
                        p.style.opacity = '1';
                    });
                }, 200);
                
                // Hide overlay
                this.overlay.classList.remove('active');
                
                // Clean up after animation
                setTimeout(() => {
                    // Reset card to original state
                    this.card.classList.remove('is-expanded', 'animate-out');
                    this.card.style.position = '';
                    this.card.style.top = '';
                    this.card.style.left = '';
                    this.card.style.width = '';
                    this.card.style.height = '';
                    this.card.style.maxHeight = '';
                    this.card.style.overflow = '';
                    this.card.style.opacity = '1';
                    this.card.style.transform = '';
                    this.content.style.display = '';
                    this.content.style.maxHeight = '';
                    this.content.style.overflowY = '';
                    this.content.style.transition = '';
                    this.content.style.opacity = '';
                    
                    // Reset paragraph styles
                    paragraphs.forEach(p => {
                        p.style.transition = '';
                        p.style.opacity = '1';
                    });
                    
                    // Remove clone
                    cardClone.remove();
                    
                    // Force reflow
                    this.card.offsetHeight;
                    
                    this.isAnimating = false;
                    this.trigger.focus();
                }, 400);
            });
        }, 250); // Increased from 200ms to give CSS animation more time to complete
    }

    // Helper method for resetting card when transform fails
    resetCardToOriginal() {
        this.card.classList.remove('is-expanded', 'animate-out');
        this.card.style.position = '';
        this.card.style.top = '';
        this.card.style.left = '';
        this.card.style.width = '';
        this.card.style.height = '';
        this.card.style.maxHeight = '';
        this.card.style.overflow = '';
        this.card.style.opacity = '1';
        this.card.style.transform = '';
        this.content.style.display = '';
        this.content.style.maxHeight = '';
        this.content.style.overflowY = '';
        this.content.style.transition = '';
        this.content.style.opacity = '';
        
        const paragraphs = this.card.querySelectorAll('.card-body p');
        paragraphs.forEach(p => {
            p.style.transition = '';
            p.style.opacity = '1';
        });
        
        this.overlay.classList.remove('active');
        this.card.offsetHeight; // Force reflow
        this.isAnimating = false;
        this.trigger.focus();
    }

    // Scrollbar compensation methods
    compensateForScrollbar() {
        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        if (scrollbarWidth > 0) {
            // Add padding to body to compensate for missing scrollbar
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            
            // Also compensate fixed elements like navbar
            const navbar = document.querySelector('.page-navbar');
            if (navbar) {
                navbar.style.paddingRight = `${scrollbarWidth}px`;
            }
        }
    }

    removeScrollbarCompensation() {
        // Remove scrollbar compensation
        document.body.style.paddingRight = '';
        
        // Remove navbar compensation
        const navbar = document.querySelector('.page-navbar');
        if (navbar) {
            navbar.style.paddingRight = '';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize expanding cards
    const cards = document.querySelectorAll('.expanding-card');
    cards.forEach(card => {
        new ExpandingCard(card);
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const expandedCard = document.querySelector('.expanding-card.is-expanded');
            if (expandedCard) {
                const closeBtn = expandedCard.querySelector('.expanding-card-close');
                closeBtn.click();
            }
        }
    });

    // Navbar functionality
    const navbar = document.querySelector('.page-navbar');
    
    window.addEventListener('scroll', function() {
        sessionStorage.setItem('scrollPosition', window.scrollY);
        sessionStorage.setItem('wasAffixed', window.scrollY > 100);
        updateNavbar();
    });

    function updateNavbar() {
        if (window.scrollY > 100) {
            navbar.classList.add('affix');
        } else {
            navbar.classList.remove('affix');
        }
    }

    updateNavbar();
    initMobileMenu();
    initPageTransitions();
    handlePageLoadFadeIn();
    initSmoothScrollWithOffset();
});

// Mobile menu functionality
function initMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navBar = document.querySelector('.nav-navbar');
    const dropdownItems = document.querySelectorAll('.dropdown-submenu > .dropdown-item');
    
    if (!hamburgerBtn || !navBar) return;
    
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        navBar.classList.toggle('show-mobile-menu');
        document.body.classList.toggle('mobile-menu-open');
    });
    
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                const submenu = this.nextElementSibling;
                const parent = this.parentElement;
                
                document.querySelectorAll('.dropdown-submenu').forEach(sub => {
                    if (sub !== parent) {
                        sub.classList.remove('active');
                    }
                });
                
                parent.classList.toggle('active');
            }
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-navbar') && !e.target.closest('.hamburger-btn')) {
            hamburgerBtn.classList.remove('active');
            navBar.classList.remove('show-mobile-menu');
            document.body.classList.remove('mobile-menu-open');
            
            document.querySelectorAll('.dropdown-submenu').forEach(sub => {
                sub.classList.remove('active');
            });
        }
    });
    
    document.querySelectorAll('.nav-link:not(.dropdown-item)').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                hamburgerBtn.classList.remove('active');
                navBar.classList.remove('show-mobile-menu');
                document.body.classList.remove('mobile-menu-open');
            }
        });
    });
    
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

// Page transitions
function initPageTransitions() {
    const allLinks = document.querySelectorAll('a[href]');
    
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                return;
            }
            
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

function startFadeTransition(targetUrl) {
    const body = document.body;
    
    body.classList.add('page-fade-out');
    
    sessionStorage.setItem('isTransitioning', 'true');
    sessionStorage.setItem('transitionTarget', targetUrl);
    
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 300);
}

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

function getNavbarHeight() {
    const navbar = document.querySelector('.page-navbar');
    if (!navbar) return 0;
    
    if (navbar.classList.contains('affix')) {
        return 70;
    } else {
        return 110;
    }
}

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

// jQuery functionality (if available)
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