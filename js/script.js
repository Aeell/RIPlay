document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal animation
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.services, .projects, .contact').forEach((section) => {
        observer.observe(section);
    });
    // Star rating functionality
    const ratingStars = document.querySelectorAll('.rating i');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            
            // Reset all stars
            ratingStars.forEach(s => {
                s.className = 'far fa-star';
            });
            
            // Fill stars up to the clicked one
            for(let i = 0; i < rating; i++) {
                ratingStars[i].className = 'fas fa-star';
            }
            
            // Show thank you message
            const reviewsSection = document.querySelector('.reviews');
            const thankYouMsg = document.createElement('p');
            thankYouMsg.textContent = 'Thank you for your rating!';
            thankYouMsg.style.color = '#2ecc71';
            thankYouMsg.style.marginTop = '1rem';
            
            // Remove any existing thank you message
            const existingMsg = reviewsSection.querySelector('p:not(.terms)');
            if (existingMsg) {
                existingMsg.remove();
            }
            
            reviewsSection.appendChild(thankYouMsg);
        });
        
        // Hover effects
        star.addEventListener('mouseover', () => {
            const rating = star.getAttribute('data-rating');
            
            for(let i = 0; i < rating; i++) {
                ratingStars[i].className = 'fas fa-star';
            }
        });
        
        star.addEventListener('mouseout', () => {
            ratingStars.forEach(s => {
                if (!s.classList.contains('active')) {
                    s.className = 'far fa-star';
                }
            });
        });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});