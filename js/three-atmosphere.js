/**
 * RAMANATHAPURAM DISTRICT TOURISM WEBSITE
 * Three.js Atmospheric Background Particles (Ocean Breeze & Golden Heritage Dust)
 * Lightweight, GPU-efficient, pauses when off-screen, auto-disabled on mobile.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeroThreeAtmosphere();
});

function initHeroThreeAtmosphere() {
    if (window.__heroThreeAtmosphereInit) return;
    window.__heroThreeAtmosphereInit = true;

    // Only run on homepage hero
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') return;

    // Respect reduced motion & low-power/mobile devices
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    if (prefersReducedMotion || isMobile) return;

    // Create canvas container if not present
    let canvasContainer = document.getElementById('hero-three-canvas');
    if (!canvasContainer) {
        canvasContainer = document.createElement('div');
        canvasContainer.id = 'hero-three-canvas';
        hero.appendChild(canvasContainer);
    }

    const width = hero.clientWidth;
    const height = hero.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 300;

    // WebGL Renderer
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        canvasContainer.appendChild(renderer.domElement);
    } catch (e) {
        console.warn('WebGL not supported or disabled', e);
        return;
    }

    // Generate Particles (Ocean cyan + Warm temple gold)
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    const colorGold = new THREE.Color(0xC89B3C);
    const colorOcean = new THREE.Color(0x22A5BF);
    const colorSand = new THREE.Color(0xE8D3A8);

    for (let i = 0; i < particleCount; i++) {
        // Position scattered in 3D volume
        positions[i * 3] = (Math.random() - 0.5) * 600;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

        // Color blending
        const rand = Math.random();
        const chosenColor = rand < 0.45 ? colorGold : (rand < 0.85 ? colorOcean : colorSand);
        colors[i * 3] = chosenColor.r;
        colors[i * 3 + 1] = chosenColor.g;
        colors[i * 3 + 2] = chosenColor.b;

        velocities.push({
            x: (Math.random() - 0.5) * 0.25,
            y: (Math.random() * 0.35 + 0.1), // Gentle upward drift
            z: (Math.random() - 0.5) * 0.15
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Texture (Soft Radial Glow)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 8,
        map: texture,
        transparent: true,
        opacity: 0.55,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation Loop with Visibility Optimization
    let isVisible = true;
    let isIntersecting = true;
    let animationFrameId = null;

    function animate() {
        if (!isVisible) return;

        const pos = geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3 + 1] += velocities[i].y;
            pos[i * 3] += velocities[i].x;

            // Wrap around boundaries
            if (pos[i * 3 + 1] > 220) pos[i * 3 + 1] = -220;
            if (pos[i * 3] > 320) pos[i * 3] = -320;
            if (pos[i * 3] < -320) pos[i * 3] = 320;
        }
        geometry.attributes.position.needsUpdate = true;

        particles.rotation.y += 0.0006;
        renderer.render(scene, camera);

        animationFrameId = requestAnimationFrame(animate);
    }

    // Viewport Intersection: Pause when Hero is scrolled out of view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isIntersecting = entry.isIntersecting;
            isVisible = isIntersecting && !document.hidden;
            if (isVisible) {
                if (!animationFrameId) animate();
            } else {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            }
        });
    }, { threshold: 0.05 });

    observer.observe(hero);

    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden && isIntersecting;
        if (isVisible && !animationFrameId) animate();
    });

    // Handle Resize (rAF throttled)
    let resizeTicking = false;
    window.addEventListener('resize', () => {
        if (!hero || resizeTicking) return;
        resizeTicking = true;
        requestAnimationFrame(() => {
            if (!hero) { resizeTicking = false; return; }
            const newW = hero.clientWidth;
            const newH = hero.clientHeight;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
            resizeTicking = false;
        });
    }, { passive: true });

    animate();
}
