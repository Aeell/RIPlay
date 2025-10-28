document.addEventListener('DOMContentLoaded', () => {
    // Language switching functionality
    const currentLang = localStorage.getItem('language') || 'en';
    const langBtns = document.querySelectorAll('.lang-btn');
    
    function setLanguage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const keys = key.split('.');
            let value = translations[lang];
            for (const k of keys) {
                value = value[k];
            }
            if (value) {
                element.textContent = value;
            }
        });

        // Update active button
        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        localStorage.setItem('language', lang);
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    // Set initial language
    setLanguage(currentLang);

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