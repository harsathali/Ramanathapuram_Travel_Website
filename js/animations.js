/**
 * RAMANATHAPURAM DISTRICT TOURISM WEBSITE — MASTER ANIMATION ENGINE
 * GSAP 3 + ScrollTrigger, Cinematic Typing, Varied Card Entrances,
 * 3D Card Tilt, Liquid Cursor Glow, Image Reveals, and Page Transitions
 */

document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    initPageTransitions();
    initHeroSequence();
    initHeroParallax();
    initTypingHeadings();
    initUnifiedHeadingAnimation();
    initScrollEntranceAnimations();
    initScrollImageReveals();
    init3DCardTilt();
    initCursorGlow();
    initScrollIndicator();
    initLightbox();
});

/**
 * 1. Cinematic Splash Screen Preloader (2.8s – 3.2s duration)
 * Sequence: Logo fades in -> Ring completes -> RAMANATHAPURAM appears -> Fade out
 */
function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        splash.style.display = 'none';
        return;
    }

    const hasSeenSplash = sessionStorage.getItem('ramnad-splash-seen');
    if (hasSeenSplash && !document.body.classList.contains('force-splash')) {
        splash.style.display = 'none';
        return;
    }

    setTimeout(() => {
        splash.classList.add('splash-hidden');
        sessionStorage.setItem('ramnad-splash-seen', 'true');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 850);
    }, 2900);
}

/**
 * 1.5. Cinematic Hero Sequence (Direct Integration Over Coastal Image)
 * Sequence:
 * 1. Hero image appears
 * 2. Location badge fades in + slides down (200ms)
 * 3. RAMANATHAPURAM reveals character-by-character (450ms)
 * 4. Title fully visible, cursor fades
 * 5. Tagline fades upward with blur-to-sharp (1200ms)
 * 6. Immersive description appears (1550ms)
 * 7. CTA buttons appear (1900ms)
 * 8. Scroll indicator appears (2150ms)
 * All completes smoothly within ~2.3 seconds!
 */
function initHeroSequence() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const heroTitle = heroSection.querySelector('.hero-title');
    const heroSubtitle = heroSection.querySelector('.hero-subtitle');
    const heroDesc = heroSection.querySelector('.hero-description');
    const heroCta = heroSection.querySelector('.hero-cta-group');
    const heroScroll = heroSection.querySelector('.scroll-indicator-wrap');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        if (heroSubtitle) heroSubtitle.classList.add('revealed');
        if (heroDesc) heroDesc.classList.add('revealed');
        if (heroCta) heroCta.classList.add('revealed');
        if (heroScroll) heroScroll.classList.add('revealed');
        return;
    }

    if (heroTitle) {
        const fullTitle = heroTitle.getAttribute('data-text') || heroTitle.textContent.trim() || 'RAMANATHAPURAM';
        heroTitle.textContent = '';
        heroTitle.style.visibility = 'visible';

        const splash = document.getElementById('splash-screen');
        const hasSeenSplash = sessionStorage.getItem('ramnad-splash-seen');
        const splashActive = splash && !splash.classList.contains('splash-hidden') && (!hasSeenSplash || document.body.classList.contains('force-splash'));
        const initialDelay = splashActive ? 2950 : 350;

        // Title typing starts after initial delay (and location badge landing)
        setTimeout(() => {
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            heroTitle.appendChild(cursor);

            let charIdx = 0;
            const typingCadence = 46; // 14 chars * 46ms = 644ms

            function typeNextChar() {
                if (charIdx < fullTitle.length) {
                    cursor.insertAdjacentText('beforebegin', fullTitle.charAt(charIdx));
                    charIdx++;
                    setTimeout(typeNextChar, typingCadence);
                } else {
                    // Title fully visible: cursor fades
                    setTimeout(() => {
                        cursor.style.transition = 'opacity 0.35s ease';
                        cursor.style.opacity = '0';
                        setTimeout(() => cursor.remove(), 350);
                    }, 350);

                    // Tagline fades upward with slight blur-to-sharp
                    setTimeout(() => {
                        if (heroSubtitle) heroSubtitle.classList.add('revealed');
                    }, 120);

                    // Description appears
                    setTimeout(() => {
                        if (heroDesc) heroDesc.classList.add('revealed');
                    }, 380);

                    // Buttons and scroll indicator appear
                    setTimeout(() => {
                        if (heroCta) heroCta.classList.add('revealed');
                        if (heroScroll) heroScroll.classList.add('revealed');
                    }, 650);
                }
            }

            typeNextChar();
        }, initialDelay);
    }
}

/**
 * 1.6. Subtle Ocean Parallax Effect on Hero Image
 * Background image moves slightly slower than the page when scrolling.
 * Text remains stable. Disabled on mobile.
 */
function initHeroParallax() {
    const heroImg = document.querySelector('.hero-bg-img');
    const heroSection = document.querySelector('.hero-section');
    if (!heroImg || !heroSection) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    if (prefersReducedMotion || isMobile) return;

    let ticking = false;
    let cachedHeroHeight = heroSection.offsetHeight;

    window.addEventListener('resize', () => {
        cachedHeroHeight = heroSection.offsetHeight;
    }, { passive: true });

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                if (scrollY <= cachedHeroHeight + 100) {
                    heroImg.style.transform = `scale(1.04) translate3d(0, ${scrollY * 0.22}px, 0)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/**
 * 2. Cinematic Typing Text Animation Engine (for non-hero headings)
 */
function initTypingHeadings() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Target elements (excluding hero title & subtitle which are handled in initHeroSequence)
    const targets = document.querySelectorAll(
        '.typing-title, [data-typing="true"]'
    );

    targets.forEach((el) => {
        const fullText = el.getAttribute('data-text') || el.textContent.trim();
        if (!fullText) return;

        // Reserve height to prevent layout shift
        const originalHeight = el.offsetHeight;
        if (originalHeight > 0) {
            el.style.minHeight = `${originalHeight}px`;
        }

        // Determine if element is currently in view (e.g. Hero) or below fold
        const rect = el.getBoundingClientRect();
        const isInInitialView = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInInitialView) {
            // Slight initial delay so hero image and badge land first
            const isSubtitle = el.classList.contains('hero-subtitle');
            const delay = isSubtitle ? 900 : 350;
            setTimeout(() => runTyping(el, fullText, isSubtitle), delay);
        } else {
            // Viewport trigger via IntersectionObserver
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        runTyping(el, fullText, false);
                        obs.unobserve(el);
                    }
                });
            }, { threshold: 0.2 });
            observer.observe(el);
        }
    });

    function runTyping(element, text, isSubtitle) {
        element.textContent = '';
        element.style.visibility = 'visible';

        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        element.appendChild(cursor);

        let index = 0;
        const speed = isSubtitle ? 32 : 45; // Smooth cinematic typing cadence

        function typeNextChar() {
            if (index < text.length) {
                const char = text.charAt(index);
                cursor.insertAdjacentText('beforebegin', char);
                index++;
                setTimeout(typeNextChar, speed);
            } else {
                // Typing finished: let cursor blink briefly then remove
                setTimeout(() => {
                    cursor.style.transition = 'opacity 0.4s ease';
                    cursor.style.opacity = '0';
                    setTimeout(() => cursor.remove(), 400);
                }, 900);
            }
        }

        typeNextChar();
    }
}

/**
 * 3. Unified Major Heading Animation (Requirement 6)
 * fade-up + slight blur to sharp + small upward movement (0.85s)
 */
function initUnifiedHeadingAnimation() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const headings = document.querySelectorAll('.section-title, .page-hero-title, .dest-title, .final-cta-banner h2');

    headings.forEach(h => {
        if (h.classList.contains('hero-title') || h.classList.contains('hero-subtitle')) return;

        if (prefersReducedMotion) {
            h.classList.add('heading-revealed');
            return;
        }

        h.classList.add('heading-reveal-ready');
    });

    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('heading-revealed');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

    headings.forEach(h => {
        if (!h.classList.contains('hero-title') && !h.classList.contains('hero-subtitle')) {
            observer.observe(h);
        }
    });
}

/**
 * 4. Varied Scroll Entrance Animations for Every Major Card
 * Uses GSAP + ScrollTrigger if available, with robust IntersectionObserver fallback.
 * Directions: fade-up, fade-right, fade-left, fade-down, scale-in, clip-reveal
 */
function initScrollEntranceAnimations() {
    if (window.__ramnadScrollEntranceInit) return;
    window.__ramnadScrollEntranceInit = true;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Collect all major cards and content sections
    const cards = Array.from(document.querySelectorAll(
        '.glass-card, .destination-card-lg, .food-card, .travel-card, ' +
        '.itinerary-card, .famous-card, .fact-card, .timeline-card, ' +
        '.gallery-item, .person-card, .contact-card, .editorial-card'
    ));

    if (cards.length === 0) return;

    const directions = ['fade-up', 'fade-right', 'fade-left', 'fade-down', 'scale-in', 'clip-reveal', 'fade-up'];

    // Assign varied directions & staggered timing if not already set
    cards.forEach((card, index) => {
        if (!card.getAttribute('data-animate')) {
            const dir = directions[index % directions.length];
            card.setAttribute('data-animate', dir);
        }
        if (prefersReducedMotion) {
            card.classList.add('is-animated');
            return;
        }
        card.classList.add('animate-ready');
    });

    if (prefersReducedMotion) return;

    // Check for GSAP and ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ limitCallbacks: true, syncInterval: 120 });

        // Group cards by parent container for elegant staggered entrances (O(N) mapping)
        const parentMap = new Map();
        cards.forEach(card => {
            const parent = card.parentElement;
            if (!parent) return;
            if (!parentMap.has(parent)) parentMap.set(parent, []);
            parentMap.get(parent).push(card);
        });

        parentMap.forEach(parentCards => {
            ScrollTrigger.batch(parentCards, {
                interval: 0.1,
                batchMax: 4,
                start: 'top 88%',
                once: true,
                fastScrollEnd: true,
                preventOverlaps: true,
                onEnter: batch => {
                    batch.forEach((card, i) => {
                        const dir = card.getAttribute('data-animate');
                        let fromProps = { opacity: 0, duration: 0.75, delay: i * 0.1, ease: 'power2.out' };

                        if (dir === 'fade-up') fromProps.y = 45;
                        else if (dir === 'fade-down') fromProps.y = -40;
                        else if (dir === 'fade-right') fromProps.x = -45;
                        else if (dir === 'fade-left') fromProps.x = 45;
                        else if (dir === 'scale-in') fromProps.scale = 0.92;
                        else if (dir === 'clip-reveal') fromProps.clipPath = 'inset(12% 12% 12% 12%)';

                        gsap.fromTo(card, fromProps, {
                            opacity: 1,
                            x: 0,
                            y: 0,
                            scale: 1,
                            clipPath: 'inset(0% 0% 0% 0%)',
                            duration: 0.75,
                            delay: i * 0.1,
                            ease: 'power2.out',
                            onComplete: () => {
                                card.classList.add('is-animated');
                                card.classList.remove('animate-ready');
                            }
                        });
                    });
                }
            });
        });
    } else {
        // High-performance IntersectionObserver Fallback
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const index = cards.indexOf(card);
                    const delay = (index % 4) * 110;

                    setTimeout(() => {
                        card.classList.add('is-animated');
                        card.classList.remove('animate-ready');
                    }, delay);

                    obs.unobserve(card);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        cards.forEach(card => observer.observe(card));
    }
}

/**
 * 5. Scroll-Triggered Image Reveals
 * Scale 1.08 -> 1, Clip-path inset(10%) -> inset(0%), Opacity 0 -> 1
 */
function initScrollImageReveals() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const imgWrappers = document.querySelectorAll('.card-media, .reveal-img-wrap, .destination-img-wrap, .person-portrait-wrap');

    imgWrappers.forEach(wrap => {
        wrap.classList.add('reveal-img-wrap');
        if (prefersReducedMotion) {
            wrap.classList.add('img-revealed');
            return;
        }
        wrap.classList.add('img-hidden');
    });

    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('img-hidden');
                entry.target.classList.add('img-revealed');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });

    imgWrappers.forEach(wrap => observer.observe(wrap));
}

/**
 * 6. Desktop 3D Card Tilt Interaction (1.5° to 2° max - Requirement 22)
 * Smooth perspective tilt on mouse movement over cards without layout reflows (rAF throttled, cached bounds)
 */
function init3DCardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const interactiveCards = document.querySelectorAll(
        '.glass-card, .destination-card-lg, .food-card, .travel-card, .famous-card, .fact-card'
    );

    interactiveCards.forEach(card => {
        let isHovered = false;
        let rect = null;
        let cardTicking = false;
        let mouseX = 0;
        let mouseY = 0;

        card.addEventListener('mouseenter', () => {
            isHovered = true;
            rect = card.getBoundingClientRect();
            card.style.transition = 'transform 0.15s ease-out, box-shadow 0.35s ease';
        }, { passive: true });

        card.addEventListener('mousemove', (e) => {
            if (!isHovered || !rect) return;
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!cardTicking) {
                requestAnimationFrame(() => {
                    if (!isHovered || !rect) {
                        cardTicking = false;
                        return;
                    }
                    const x = mouseX - rect.left;
                    const y = mouseY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Maximum subtle tilt 1.8 degrees
                    const tiltX = ((y - centerY) / centerY) * -1.8;
                    const tiltY = ((x - centerX) / centerX) * 1.8;

                    card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-6px) scale(1.01)`;
                    cardTicking = false;
                });
                cardTicking = true;
            }
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            isHovered = false;
            rect = null;
            cardTicking = false;
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
        }, { passive: true });
    });
}

/**
 * 7. Desktop Mouse Tracking Radial Cursor Glow & Card Liquid Reflections
 * Pure GPU-friendly translate3d interpolation, auto-idle loop, and card-clipped liquid reflection.
 */
function initCursorGlow() {
    const cursorGlow = document.getElementById('cursor-glow');
    if (!cursorGlow) return;

    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cursorGlow.style.display = 'none';
        return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isTicking = false;
    let hasMoved = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!hasMoved) {
            hasMoved = true;
            cursorGlow.style.opacity = '1';
        }
        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(renderGlow);
        }
    }, { passive: true });

    function renderGlow() {
        const dx = mouseX - currentX;
        const dy = mouseY - currentY;
        // Smooth cinematic lag (0.12 factor)
        currentX += dx * 0.12;
        currentY += dy * 0.12;

        cursorGlow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

        // If mouse is nearly stationary, pause loop until next movement
        if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
            requestAnimationFrame(renderGlow);
        } else {
            isTicking = false;
        }
    }

    // Subtle reaction when hovering interactive elements
    const interactiveElements = document.querySelectorAll(
        '.nav-link, .btn, .glass-card, .food-card, .destination-card-lg, .fact-card, .person-media-wrap, .dropdown-item a'
    );
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorGlow.style.width = '390px';
            cursorGlow.style.height = '390px';
        }, { passive: true });
        el.addEventListener('mouseleave', () => {
            cursorGlow.style.width = '340px';
            cursorGlow.style.height = '340px';
        }, { passive: true });
    });

    // Card-clipped liquid reflection tracking
    const reflectiveCards = document.querySelectorAll(
        '.glass-card, .food-card, .destination-card-lg, .fact-card, .person-media-wrap'
    );
    reflectiveCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }, { passive: true });
    });
}

/**
 * 7. Cinematic Scroll Indicator Interaction
 */
function initScrollIndicator() {
    const indicators = document.querySelectorAll('.scroll-indicator-wrap');
    indicators.forEach(indicator => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            const heroSection = indicator.closest('.hero-section, .page-hero');
            if (!heroSection) return;

            const nextSection = heroSection.nextElementSibling;
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * 8. Premium Seamless Page-to-Page Transitions (420ms)
 */
function initPageTransitions() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let curtain = document.getElementById('page-transition-curtain');
    if (!curtain) {
        curtain = document.createElement('div');
        curtain.id = 'page-transition-curtain';
        document.body.appendChild(curtain);
    }

    // Intercept internal page navigation links
    const internalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])');

    internalLinks.forEach(link => {
        const url = link.getAttribute('href');
        // Only internal html pages
        if (!url || !url.endsWith('.html') && !url.endsWith('/')) return;

        link.addEventListener('click', (e) => {
            // Check modifier keys for new tab
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;

            const targetUrl = link.href;
            if (targetUrl === window.location.href) return;

            e.preventDefault();
            curtain.classList.add('transition-active');

            setTimeout(() => {
                window.location.href = targetUrl;
            }, 380);
        });
    });
}

/**
 * 9. Image Lightbox Viewer
 */
function initLightbox() {
    const lightboxModal = document.getElementById('lightbox-modal');
    if (!lightboxModal) return;

    const lightboxImg = lightboxModal.querySelector('.lightbox-img');
    const lightboxCaption = lightboxModal.querySelector('.lightbox-caption');
    const closeBtn = lightboxModal.querySelector('.lightbox-close');
    const prevBtn = lightboxModal.querySelector('.lightbox-prev');
    const nextBtn = lightboxModal.querySelector('.lightbox-next');

    const triggers = Array.from(document.querySelectorAll('[data-lightbox-src]'));
    let currentIndex = 0;

    if (triggers.length === 0) return;

    function openLightbox(index) {
        currentIndex = index;
        const trigger = triggers[currentIndex];
        const src = trigger.getAttribute('data-lightbox-src') || trigger.getAttribute('src');
        const caption = trigger.getAttribute('data-lightbox-caption') || trigger.getAttribute('alt') || 'Ramanathapuram Heritage';

        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % triggers.length;
        openLightbox(currentIndex);
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + triggers.length) % triggers.length;
        openLightbox(currentIndex);
    }

    triggers.forEach((trigger, idx) => {
        trigger.style.cursor = 'pointer';
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(idx);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);

    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });
}
