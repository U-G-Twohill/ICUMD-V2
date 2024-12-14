// Wait for DOM to be fully loaded before running script
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the navigation bar
    const navbar = document.querySelector('.page-navbar');
    
    // Listen for scroll events and update navbar state in session storage
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

    // Retrieve previous page state from session storage
    const lastScroll = sessionStorage.getItem('scrollPosition');
    const wasAffixed = sessionStorage.getItem('wasAffixed') === 'true';
    const isCurrentlyAtTop = window.scrollY <= 100;
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navBar = document.querySelector('.nav-navbar');

    // Check if we're navigating to a specific section using URL hash
    const hasHash = window.location.hash !== '';

    // Handle different navigation scenarios
    if ((wasAffixed && lastScroll > 100 && window.scrollY > 100) || hasHash) {
        // Scenario 1: Either coming from a scrolled position to another scrolled position
        // OR navigating to a specific section via hash
        // Action: Instantly affix navbar without animation
        navbar.classList.add('affix', 'no-transition');
        navbar.offsetHeight; // Force browser reflow to ensure no-transition takes effect
        navbar.classList.remove('no-transition');
        // Update stored state
        sessionStorage.setItem('wasAffixed', 'true');
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    } else if (wasAffixed && isCurrentlyAtTop) {
        // Scenario 2: Coming from a scrolled position to the top of the page
        // Action: Animate the navbar's removal
        navbar.classList.add('affix', 'no-transition');
        navbar.offsetHeight; // Force reflow
        navbar.classList.remove('no-transition');
        setTimeout(() => {
            navbar.classList.remove('affix');
            // Reset stored state after animation
            sessionStorage.setItem('wasAffixed', 'false');
            sessionStorage.setItem('scrollPosition', '0');
        }, 50);
    } else if (wasAffixed && lastScroll > 100 && window.scrollY > 100) {
        // Scenario 3: Moving between scrolled positions
        // Action: Instant navbar update without animation
        navbar.classList.add('affix', 'no-transition');
        navbar.offsetHeight; // Force reflow
        navbar.classList.remove('no-transition');
        // Update stored state
        sessionStorage.setItem('wasAffixed', 'true');
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    } else {
        // Scenario 4: Direct navigation between top positions
        // Action: Normal navbar behavior without special handling
        updateNavbar();
        // Reset stored state
        sessionStorage.setItem('wasAffixed', 'false');
        sessionStorage.setItem('scrollPosition', '0');
    }

    // Only add hamburger button event listeners if the elements exist
    if (hamburgerBtn && navBar) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent click from bubbling up
            this.classList.toggle('active');
            navBar.classList.toggle('show-mobile-menu');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav-navbar')) {
                hamburgerBtn.classList.remove('active');
                navBar.classList.remove('show-mobile-menu');
            }
        });
    }
    
});

// jQuery document ready handler for various UI interactions
$(document).ready(function(){
    // Toggle search functionality
    $('.search-toggle').click(function(){
        $('.search-wrapper').toggleClass('show');
    });

    // Toggle modal box
    $('.modal-toggle').click(function(){
        $('.modalBox').toggleClass('show');
    })

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

// Smooth scroll functionality for navbar links
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {
        // Check if the link has a hash (indicates it's an anchor link)
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();

            var hash = this.hash;

            // Animate scroll to target
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function(){
                // Add hash to URL after scroll
                window.location.hash = hash;
            });
        } 
    });
}); 


