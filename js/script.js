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

        // DOM placement tracking — card moves to body when expanded
        this.originalParent = null;
        this.originalNextSibling = null;
        this.placeholder = null;
        this.savedScrollY = 0;

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
    }

    expand() {
        if (this.isAnimating || this.isExpanded) return;

        this.isAnimating = true;
        this.isExpanded = true;

        // Get card position before any layout changes
        const rect = this.card.getBoundingClientRect();
        this.savedScrollY = window.scrollY;

        // Lock scroll (no position:fixed — just prevent scrolling)
        this.compensateForScrollbar();
        document.body.classList.add('card-expanded');

        // Store DOM position so we can return the card later
        this.originalParent = this.card.parentNode;
        this.originalNextSibling = this.card.nextSibling;

        // Leave a placeholder to hold layout space
        this.placeholder = document.createElement('div');
        this.placeholder.style.width = `${rect.width}px`;
        this.placeholder.style.height = `${rect.height}px`;
        this.placeholder.style.visibility = 'hidden';
        this.originalParent.insertBefore(this.placeholder, this.originalNextSibling);

        // Move card to body — escapes stacking context from .reveal will-change
        document.body.appendChild(this.card);

        // Position card exactly where it was visually
        this.card.style.position = 'fixed';
        this.card.style.top = `${rect.top}px`;
        this.card.style.left = `${rect.left}px`;
        this.card.style.width = `${rect.width}px`;
        this.card.style.margin = '0';
        this.card.style.zIndex = '1001';

        // Show overlay
        this.overlay.classList.add('active');

        // Calculate target dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const navbarHeight = getNavbarHeight();
        const topGap = 20;
        const availableHeight = viewportHeight - navbarHeight - topGap - 20;
        const targetWidth = Math.min(viewportWidth * 0.9, 800);
        const targetTop = navbarHeight + topGap;

        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);

        // Fade out paragraph text
        const paragraphs = this.card.querySelectorAll('.card-body p');
        paragraphs.forEach(p => {
            p.style.transition = 'opacity 0.2s ease-out';
            p.style.opacity = '0';
        });

        // Animate to top-center
        requestAnimationFrame(() => {
            this.card.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), left 0.4s cubic-bezier(0.4,0,0.2,1), width 0.4s cubic-bezier(0.4,0,0.2,1)';
            this.card.style.top = `${targetTop}px`;
            this.card.style.left = `${(viewportWidth - targetWidth) / 2}px`;
            this.card.style.width = `${targetWidth}px`;

            setTimeout(() => {
                // Animation done — show expanded content
                this.card.style.transition = '';
                this.card.style.maxHeight = `${availableHeight}px`;
                // Start with no scrollbar — check after content animation finishes
                this.card.style.overflowY = 'hidden';
                setTimeout(() => {
                    if (this.card.scrollHeight > this.card.clientHeight) {
                        this.card.style.overflowY = 'auto';
                    }
                }, 800);
                this.card.classList.add('is-expanded', 'animate-in');

                // Show content and let it fill the card width naturally
                this.content.style.display = 'block';
                this.content.style.width = '100%';

                // Collapse the trigger so card image/body are compact
                this.trigger.style.display = 'block';
                this.trigger.style.height = 'auto';

                // Fade paragraphs back in
                setTimeout(() => {
                    paragraphs.forEach(p => {
                        p.style.transition = 'opacity 0.3s ease-in';
                        p.style.opacity = '1';
                    });
                }, 50);

                this.isAnimating = false;
                this.closeBtn.focus();
            }, 420);
        });
    }

    collapse() {
        if (this.isAnimating || !this.isExpanded) return;

        this.isAnimating = true;
        this.isExpanded = false;

        // Fade out content
        this.card.classList.remove('animate-in');
        this.card.classList.add('animate-out');

        const paragraphs = this.card.querySelectorAll('.card-body p');
        paragraphs.forEach(p => {
            p.style.transition = 'opacity 0.2s ease-out';
            p.style.opacity = '0';
        });

        setTimeout(() => {
            // Hide expanded content and reset trigger
            this.content.style.display = '';
            this.content.style.width = '';
            this.trigger.style.height = '';
            this.card.style.maxHeight = '';
            this.card.style.overflowY = '';
            this.card.classList.remove('is-expanded', 'animate-out');

            // Get placeholder position (where the card needs to return to)
            const targetRect = this.placeholder.getBoundingClientRect();
            this.card.offsetHeight; // Force reflow

            // Animate back to original position
            this.card.style.transition = 'top 0.4s cubic-bezier(0.4,0,0.2,1), left 0.4s cubic-bezier(0.4,0,0.2,1), width 0.4s cubic-bezier(0.4,0,0.2,1)';
            this.card.style.top = `${targetRect.top}px`;
            this.card.style.left = `${targetRect.left}px`;
            this.card.style.width = `${targetRect.width}px`;

            // Hide overlay
            this.overlay.classList.remove('active');

            // Fade paragraphs back in
            setTimeout(() => {
                paragraphs.forEach(p => {
                    p.style.transition = 'opacity 0.3s ease-in';
                    p.style.opacity = '1';
                });
            }, 200);

            setTimeout(() => {
                // Animation done — return card to original DOM position
                this.card.style.transition = '';
                this.card.style.position = '';
                this.card.style.top = '';
                this.card.style.left = '';
                this.card.style.width = '';
                this.card.style.height = '';
                this.card.style.maxHeight = '';
                this.card.style.overflow = '';
                this.card.style.overflowY = '';
                this.card.style.margin = '';
                this.card.style.zIndex = '';
                this.card.style.transform = '';

                paragraphs.forEach(p => {
                    p.style.transition = '';
                    p.style.opacity = '';
                });

                // Move card back to its original DOM position
                if (this.originalNextSibling) {
                    this.originalParent.insertBefore(this.card, this.originalNextSibling);
                } else {
                    this.originalParent.appendChild(this.card);
                }

                // Remove placeholder
                if (this.placeholder && this.placeholder.parentNode) {
                    this.placeholder.remove();
                }

                // Unlock scroll — no position trickery, just remove overflow lock
                document.body.classList.remove('card-expanded');
                this.removeScrollbarCompensation();

                this.card.offsetHeight; // Force reflow
                this.isAnimating = false;
                this.trigger.focus();
            }, 420);
        }, 250);
    }

    compensateForScrollbar() {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            const navbar = document.querySelector('.page-navbar');
            if (navbar) {
                navbar.style.paddingRight = `${scrollbarWidth}px`;
            }
        }
    }

    removeScrollbarCompensation() {
        document.body.style.paddingRight = '';
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
    setActiveNavLink();
    initInlineFAQ();
    initScrollReveal();
    initCounters();
    initHeroStagger();
});

// Mobile menu functionality
function initMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navBar = document.querySelector('.nav-navbar');
    const dropdownItems = document.querySelectorAll('.dropdown-submenu > .dropdown-item');

    if (!hamburgerBtn || !navBar) return;

    // Store scrollbar width for layout-shift compensation
    document.documentElement.style.setProperty(
        '--scrollbar-width',
        (window.innerWidth - document.documentElement.clientWidth) + 'px'
    );

    var isClosing = false;

    function openMenu() {
        hamburgerBtn.classList.add('active');
        navBar.classList.remove('closing-mobile-menu');
        navBar.classList.add('show-mobile-menu');
        document.body.classList.add('mobile-menu-open');
    }

    function closeMenu() {
        if (!navBar.classList.contains('show-mobile-menu') || isClosing) return;
        isClosing = true;
        hamburgerBtn.classList.remove('active');
        navBar.classList.remove('show-mobile-menu');
        navBar.classList.add('closing-mobile-menu');

        // Wait for slide-out animation to finish, then clean up
        setTimeout(function() {
            navBar.classList.remove('closing-mobile-menu');
            document.body.classList.remove('mobile-menu-open');
            document.querySelectorAll('.dropdown-submenu').forEach(function(sub) {
                sub.classList.remove('active');
            });
            isClosing = false;
        }, 300);
    }

    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (navBar.classList.contains('show-mobile-menu')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();

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
            closeMenu();
        }
    });

    document.querySelectorAll('.nav-link:not(.dropdown-item)').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            hamburgerBtn.classList.remove('active');
            navBar.classList.remove('show-mobile-menu');
            navBar.classList.remove('closing-mobile-menu');
            document.body.classList.remove('mobile-menu-open');
            isClosing = false;
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

    // Animate the active nav underline out before fading
    const activeLink = document.querySelector('.nav-navbar > .nav-item > .nav-link.active');
    if (activeLink) {
        activeLink.classList.remove('active');
    }

    // Start page fade-out after underline begins shrinking
    setTimeout(() => {
        body.classList.add('page-fade-out');

        sessionStorage.setItem('isTransitioning', 'true');
        sessionStorage.setItem('transitionTarget', targetUrl);

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 300);
    }, 150);
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

// Inline FAQ accordion toggle
function initInlineFAQ() {
    const faqItems = document.querySelectorAll('.inline-faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.inline-faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const parent = item.closest('.inline-faq');
                // Close other items in the same FAQ block
                if (parent) {
                    parent.querySelectorAll('.inline-faq-item.active').forEach(activeItem => {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                        }
                    });
                }
                item.classList.toggle('active');
            });
        }
    });
}

// Active nav link
function setActiveNavLink() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var map = {
        'index.html': 'Home',
        'about.html': 'About us',
        'services.html': 'Services',
        'design.html': 'Services',
        'solutions.html': 'Services',
        'portfolio.html': 'Portfolio',
        'contact.html': 'Contact Us',
        'faq.html': 'FAQ'
    };
    var activeText = map[currentPage];
    if (!activeText) return;

    document.querySelectorAll('.nav-navbar > .nav-item > .nav-link').forEach(function(link) {
        if (link.textContent.trim() === activeText) {
            // Double rAF so browser renders width:0 first, then transitions to 85%
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    link.classList.add('active');
                });
            });
        }
    });
}

// Scroll Reveal — Intersection Observer
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(function(el) {
        observer.observe(el);
    });
}

// Animated Counters
function initCounters() {
    const counters = document.querySelectorAll('.counter-value');
    if (!counters.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var target = parseFloat(el.getAttribute('data-target'));
                var suffix = el.getAttribute('data-suffix') || '';
                var duration = 2000;
                var start = 0;
                var startTime = null;

                function step(timestamp) {
                    if (!startTime) startTime = timestamp;
                    var progress = Math.min((timestamp - startTime) / duration, 1);
                    // Ease-out cubic
                    var eased = 1 - Math.pow(1 - progress, 3);
                    var current = Math.floor(eased * target);
                    el.textContent = current + suffix;
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.textContent = target + suffix;
                    }
                }

                requestAnimationFrame(step);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    counters.forEach(function(el) {
        observer.observe(el);
    });
}

// Hero Stagger Animation
function initHeroStagger() {
    var words = document.querySelectorAll('.stagger-word');
    words.forEach(function(word, i) {
        word.style.animationDelay = (i * 0.1) + 's';
    });
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
    });
}