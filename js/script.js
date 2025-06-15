// Handle immediate page state before DOM loads to prevent flashing
(function() {
    // Check if this is a page transition as early as possible
    if (sessionStorage.getItem('isTransitioning') === 'true') {
        // Add fade-in class immediately to prevent flash
        document.documentElement.classList.add('transitioning');
        
        // Add style to head immediately
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

// Wait for DOM to be fully loaded before running script
document.addEventListener('DOMContentLoaded', function() {
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
        // Toggle search functionality
        $('.search-toggle').click(function(){
            $('.search-wrapper').toggleClass('show');
        });

        // Toggle modal box
        $('.modal-toggle').click(function(){
            $('.modalBox').toggleClass('show');
        });

        // Close modal when clicking on it
        $('.modalBox').click(function(){
            $(this).removeClass('show');
        });

        // Theme selector functionality
        $('.spinner').click(function(){
            $(".theme-selector").toggleClass('show');
        });

        // Light theme selection
        $('.light').click(function(){
            $('body').addClass('light-theme');
            $('body').removeClass('dark-theme');
        });

        // Dark theme selection
        $('.dark').click(function(){
            $('body').toggleClass('dark-theme');
            $('body').removeClass('light-theme');
        });
    });
}