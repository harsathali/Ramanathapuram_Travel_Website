/**
 * RAMANATHAPURAM DISTRICT TOURISM WEBSITE
 * Swiper.js Horizontal Storytelling & Destination Carousel Integration
 */

document.addEventListener('DOMContentLoaded', () => {
    initSwiperCarousels();
});

function initSwiperCarousels() {
    if (typeof Swiper === 'undefined') return;

    // 1. Featured Attractions / Highlights Swiper (Homepage & Attractions)
    const attractionSwipers = document.querySelectorAll('.attractions-swiper');
    attractionSwipers.forEach(container => {
        if (container.swiper || container.classList.contains('swiper-initialized')) return;
        new Swiper(container, {
            slidesPerView: 1,
            spaceBetween: 24,
            grabCursor: true,
            speed: 650,
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            pagination: {
                el: container.querySelector('.swiper-pagination') || '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: container.querySelector('.swiper-button-next') || '.swiper-button-next',
                prevEl: container.querySelector('.swiper-button-prev') || '.swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
            },
        });
    });

    // 2. Generic Gallery or Story Swipers
    const genericSwipers = document.querySelectorAll('.swiper:not(.attractions-swiper)');
    genericSwipers.forEach(container => {
        if (container.swiper || container.classList.contains('swiper-initialized')) return;
        new Swiper(container, {
            slidesPerView: 1,
            spaceBetween: 20,
            grabCursor: true,
            speed: 600,
            pagination: {
                el: container.querySelector('.swiper-pagination'),
                clickable: true,
            },
            navigation: {
                nextEl: container.querySelector('.swiper-button-next'),
                prevEl: container.querySelector('.swiper-button-prev'),
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                },
                1100: {
                    slidesPerView: 3,
                    spaceBetween: 28,
                }
            }
        });
    });
}
