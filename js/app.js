class I18n {
    constructor() {
        this.translations = {};
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.observers = new Set();
    }

    async loadTranslation(language) {
        try {
            const response = await fetch(`/locales/${language}.json`);
            if (!response.ok) throw new Error(`Failed to load ${language} translations`);
            this.translations[language] = await response.json();
            return true;
        } catch (error) {
            console.error('Translation load error:', error);
            return false;
        }
    }

    async setLanguage(language) {
        if (this.currentLanguage === language) return;
        
        if (!this.translations[language]) {
            const loaded = await this.loadTranslation(language);
            if (!loaded) return;
        }

        this.currentLanguage = language;
        localStorage.setItem('language', language);
        this.notifyObservers();
    }

    translate(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        try {
            for (const k of keys) {
                value = value[k];
            }
            return value || key;
        } catch (error) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }
    }

    addObserver(callback) {
        this.observers.add(callback);
    }

    removeObserver(callback) {
        this.observers.delete(callback);
    }

    notifyObservers() {
        this.observers.forEach(callback => callback(this.currentLanguage));
    }
}

class App {
    constructor() {
        this.i18n = new I18n();
        this.setupEventListeners();
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Show loading state
            document.body.classList.add('loading');

            // Initialize language
            await this.i18n.loadTranslation(this.i18n.currentLanguage);
            this.updateLanguageUI();
            this.updateContent();

            // Initialize animations
            this.setupScrollAnimations();
            
            // Initialize other features
            await Promise.all([
                this.setupWeather(),
                this.setupRating()
            ]);

            // Register service worker for offline support
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register('/sw.js');
                    console.log('Service Worker registered');
                } catch (error) {
                    console.warn('Service Worker registration failed:', error);
                }
            }

            // Remove loading state
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');

        } catch (error) {
            console.error('App initialization failed:', error);
            document.body.classList.remove('loading');
            document.body.classList.add('error');
        }
    }

    setupEventListeners() {
        // Language switching
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.i18n.setLanguage(lang);
            });
        });

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    updateLanguageUI() {
        const currentLang = this.i18n.currentLanguage;
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });
    }

    updateContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.i18n.translate(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.tagName === 'IMG') {
                element.alt = translation;
            } else {
                element.textContent = translation;
            }
        });
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add stagger effect for lists
                    if (entry.target.classList.contains('feature-list')) {
                        entry.target.querySelectorAll('li').forEach((item, index) => {
                            item.style.animationDelay = `${index * 100}ms`;
                            item.classList.add('fade-in');
                        });
                    }
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '50px'
        });

        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            observer.observe(element);
        });
    }

    async setupWeather() {
        const weatherTemp = document.getElementById('weather-temp');
        if (!weatherTemp) return;

        const updateWeather = async () => {
            try {
                // Using a free weather API (replace API_KEY with actual key)
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=Liberec&units=metric&appid=YOUR_API_KEY`
                );
                const data = await response.json();
                
                if (data.main) {
                    const temp = Math.round(data.main.temp);
                    weatherTemp.textContent = `${temp}°`;
                }
            } catch (error) {
                console.error('Weather update failed:', error);
                weatherTemp.textContent = '7°'; // Fallback temperature
            }
        };

        // Update weather immediately and then every 15 minutes
        await updateWeather();
        setInterval(updateWeather, 900000);
    }

    setupRating() {
        const stars = document.querySelectorAll('.rating i');
        const storedRating = localStorage.getItem('user-rating');
        
        if (storedRating) {
            this.updateRating(parseInt(storedRating));
        }

        stars.forEach(star => {
            // Hover effects
            star.addEventListener('mouseenter', () => {
                const hoverRating = parseInt(star.dataset.rating);
                this.updateRating(hoverRating, true);
            });

            star.addEventListener('mouseleave', () => {
                const currentRating = localStorage.getItem('user-rating');
                this.updateRating(currentRating ? parseInt(currentRating) : 0);
            });

            // Click to rate
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                localStorage.setItem('user-rating', rating.toString());
                this.updateRating(rating);
                
                // Show thank you message
                const terms = document.querySelector('.terms');
                if (terms) {
                    const originalText = terms.textContent;
                    terms.textContent = this.i18n.translate('rating.thankyou');
                    setTimeout(() => {
                        terms.textContent = originalText;
                    }, 3000);
                }
            });
        });
    }

    updateRating(rating, isHover = false) {
        const stars = document.querySelectorAll('.rating i');
        stars.forEach((star, index) => {
            const starRating = parseInt(star.dataset.rating);
            star.className = starRating <= rating ? 'fas fa-star' : 'far fa-star';
            
            if (!isHover) {
                if (starRating <= rating) {
                    star.style.color = 'var(--color-accent)';
                    star.style.textShadow = 'var(--glow-gold)';
                } else {
                    star.style.color = 'var(--text-muted)';
                    star.style.textShadow = 'none';
                }
            }
        });
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});