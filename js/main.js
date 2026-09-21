/**
 * RAMANATHAPURAM DISTRICT TOURISM WEBSITE
 * Core Logic & Widgets: Live IST Clock, Theme Switcher, Mobile Drawer,
 * Accordions, Scroll Reveal, Back-to-Top, and Viewport-Triggered Counter
 */

document.addEventListener('DOMContentLoaded', () => {
    initLiveISTClock();
    initThemeSwitcher();
    initStickyHeader();
    initMobileNav();
    initTriviaAccordion();
    initScrollProgressBar();
    initBackToTop();
    initScrollReveal();
    initCounterAnimation();
    initInteractiveDistrictMap();
    initTravelGuideTimeline();
});

/**
 * 1. Live Indian Standard Time (IST - UTC+5:30) & Date Ticker
 */
function initLiveISTClock() {
    const clockElements = document.querySelectorAll('.live-ist-clock');
    const dateElements = document.querySelectorAll('.live-ist-date');

    function updateIST() {
        const now = new Date();
        const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(utcMs + istOffset);

        let hours = istDate.getHours();
        const minutes = String(istDate.getMinutes()).padStart(2, '0');
        const seconds = String(istDate.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = String(hours).padStart(2, '0');
        const timeStr = `${hoursStr}:${minutes}:${seconds} ${ampm} IST`;

        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const dateStr = istDate.toLocaleDateString('en-IN', options);

        clockElements.forEach(el => {
            el.textContent = timeStr;
        });

        dateElements.forEach(el => {
            el.textContent = dateStr;
        });
    }

    updateIST();
    setInterval(updateIST, 1000);
}

/**
 * 2. Theme Engine (Light / Dark with localStorage persistence)
 */
function initThemeSwitcher() {
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    const savedTheme = localStorage.getItem('ramnad-theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('ramnad-theme', nextTheme);
            updateThemeIcons(nextTheme);
        });
    });

    function updateThemeIcons(theme) {
        themeButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (!icon) return;
            if (theme === 'dark') {
                icon.className = 'fa-solid fa-moon';
                btn.setAttribute('aria-label', 'Toggle dark and light mode');
                btn.title = 'Switch to Light Mode';
            } else {
                icon.className = 'fa-solid fa-sun';
                btn.setAttribute('aria-label', 'Toggle dark and light mode');
                btn.title = 'Switch to Dark Mode';
            }
        });
    }
}

/**
 * 3. Unified High-Performance Scroll Engine (Sticky Header, Progress Bar, Back-To-Top)
 * Throttled via requestAnimationFrame, caches document scroll height to prevent layout reflows,
 * and toggles DOM classes only when threshold boundaries (50px / 350px) are crossed.
 */
let scrollEngineInitialized = false;

function initUnifiedScrollEffects() {
    if (scrollEngineInitialized) return;
    scrollEngineInitialized = true;

    const header = document.querySelector('header.site-header');
    const progressBar = document.getElementById('scroll-progress');
    const backBtn = document.getElementById('back-to-top');

    if (!header && !progressBar && !backBtn) return;

    let isHeaderScrolled = false;
    let isBackBtnVisible = false;
    let ticking = false;
    let cachedMaxScroll = 0;

    function updateMetrics() {
        cachedMaxScroll = document.documentElement.scrollHeight - window.innerHeight;
    }

    updateMetrics();
    window.addEventListener('resize', updateMetrics, { passive: true });

    function onScrollTick() {
        const scrollY = window.scrollY;

        // 1. Sticky Header Effect (50px threshold)
        if (header) {
            const shouldBeScrolled = scrollY > 50;
            if (shouldBeScrolled !== isHeaderScrolled) {
                isHeaderScrolled = shouldBeScrolled;
                header.classList.toggle('scrolled', isHeaderScrolled);
            }
        }

        // 2. Top Scroll Progress Bar (using cached height - zero layout reflows!)
        if (progressBar && cachedMaxScroll > 0) {
            const progress = Math.min(Math.max((scrollY / cachedMaxScroll) * 100, 0), 100);
            progressBar.style.width = `${progress}%`;
        }

        // 3. Floating Back-to-Top Button (350px threshold)
        if (backBtn) {
            const shouldBeVisible = scrollY > 350;
            if (shouldBeVisible !== isBackBtnVisible) {
                isBackBtnVisible = shouldBeVisible;
                backBtn.classList.toggle('visible', isBackBtnVisible);
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScrollTick);
            ticking = true;
        }
    }, { passive: true });

    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

function initStickyHeader() {
    initUnifiedScrollEffects();
}

/**
 * 4. Mobile Navigation Drawer & Submenu Accordions
 */
function initMobileNav() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileDrawer = document.querySelector('.mobile-nav-drawer');
    const closeBtn = document.querySelector('.mobile-close-btn');
    const backdrop = document.querySelector('.mobile-backdrop');
    const accordionHeaders = document.querySelectorAll('.mobile-accordion-header');

    if (!hamburgerBtn || !mobileDrawer) return;

    function openDrawer() {
        mobileDrawer.classList.add('active');
        if (backdrop) backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        mobileDrawer.classList.remove('active');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.getAttribute('data-target');
            const subnav = document.getElementById(targetId);
            if (!subnav) return;

            const isOpen = subnav.classList.contains('active');

            document.querySelectorAll('.mobile-subnav').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.mobile-accordion-header').forEach(h => h.classList.remove('active'));

            if (!isOpen) {
                subnav.classList.add('active');
                header.classList.add('active');
            }
        });
    });
}

/**
 * 5. Trivia / FAQ Accordion
 */
function initTriviaAccordion() {
    const triviaHeaders = document.querySelectorAll('.trivia-header');
    triviaHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.trivia-item');
            if (!item) return;

            const isActive = item.classList.contains('active');

            document.querySelectorAll('.trivia-item').forEach(i => i.classList.remove('active'));

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * 6. Top Scroll Progress Bar
 */
function initScrollProgressBar() {
    initUnifiedScrollEffects();
}

/**
 * 7. Floating Back-to-Top Button
 */
function initBackToTop() {
    initUnifiedScrollEffects();
}

/**
 * 8. Scroll Reveal Observer for Editorial Animations
 */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/**
 * 9. Animated Quick Facts Counter (Viewport Triggered)
 * Counts from 0 up to data-counter value (supports floats and ints)
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    function animateCount(el) {
        const targetVal = parseFloat(el.getAttribute('data-counter'));
        const suffix = el.getAttribute('data-counter-suffix') || '';
        const prefix = el.getAttribute('data-counter-prefix') || '';
        const isDecimal = String(targetVal).includes('.');
        const decimalPlaces = isDecimal ? (String(targetVal).split('.')[1].length || 2) : 0;
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutExpo function
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = targetVal * ease;

            if (isDecimal) {
                el.textContent = `${prefix}${current.toLocaleString('en-US', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces })}${suffix}`;
            } else {
                el.textContent = `${prefix}${Math.floor(current).toLocaleString('en-US')}${suffix}`;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                if (isDecimal) {
                    el.textContent = `${prefix}${targetVal.toLocaleString('en-US', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces })}${suffix}`;
                } else {
                    el.textContent = `${prefix}${targetVal.toLocaleString('en-US')}${suffix}`;
                }
            }
        }

        requestAnimationFrame(update);
    }

    if (!('IntersectionObserver' in window)) {
        counters.forEach(animateCount);
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    counters.forEach(c => observer.observe(c));
}

/**
 * 10. Interactive District Map Pins & Tooltip Interactions (Requirement 27)
 * Locations: Ramanathapuram, Rameswaram, Pamban, Dhanushkodi, Paramakudi,
 * Kilakarai, Thiru Uthirakosamangai, Thiruppullani
 */
function initInteractiveDistrictMap() {
    const mapContainer = document.querySelector('.district-interactive-map');
    if (!mapContainer) return;

    const pins = mapContainer.querySelectorAll('.map-location-pin');
    const tooltip = mapContainer.querySelector('.map-dynamic-tooltip');

    pins.forEach(pin => {
        pin.addEventListener('mouseenter', (e) => {
            const name = pin.getAttribute('data-name');
            const role = pin.getAttribute('data-role');
            if (tooltip && name) {
                tooltip.innerHTML = `<strong>${name}</strong><span>${role || ''}</span>`;
                tooltip.classList.add('active');

                const rect = pin.getBoundingClientRect();
                const containerRect = mapContainer.getBoundingClientRect();
                const left = rect.left - containerRect.left + (rect.width / 2);
                const top = rect.top - containerRect.top - 12;

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
            }
        });

        pin.addEventListener('mouseleave', () => {
            if (tooltip) tooltip.classList.remove('active');
        });

        pin.addEventListener('click', () => {
            const targetId = pin.getAttribute('data-target');
            if (targetId) {
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

/**
 * 11. Travel Guide Day 1/2/3 Timeline & Heritage Trail Route (Requirement 26)
 */
function initTravelGuideTimeline() {
    const itineraryCards = document.querySelectorAll('.itinerary-card');
    if (itineraryCards.length > 0) {
        itineraryCards.forEach((card, idx) => {
            card.style.transitionDelay = `${idx * 160}ms`;
        });
    }

    // Heritage Trail Progressive Line
    const trailSection = document.querySelector('.card-07-heritage-trail');
    const trailPath = document.querySelector('.trail-route-path');

    if (trailSection && trailPath) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    trailPath.classList.add('path-drawn');
                }
            });
        }, { threshold: 0.3 });
        observer.observe(trailSection);
    }
}

