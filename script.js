// Custom script for portfolio animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // --- 3D Tilt Effect for Cards ---
    VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        perspective: 1000,
        scale: 1.03
    });

    // --- Smooth Scrolling ---
    const lenis = new Lenis()

    lenis.on('scroll', (e) => {
      console.log(e)
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)


    // --- Typing Animation for Roles ---
    const roles = ["Software Engineer", "Competitive Programmer", "AI/ML Enthusiast", "Java Developer"];
    const roleTextElement = document.getElementById('role-text');
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeAnimation() {
        const currentRole = roles[roleIndex];
        let displayText = '';

        if (isDeleting) {
            displayText = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            displayText = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        roleTextElement.textContent = displayText;
        roleTextElement.classList.add('tracking-wider');

        let typeSpeed = isDeleting ? 100 : 150;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000; // Pause at the end of the word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500; // Pause before typing the next word
        }

        setTimeout(typeAnimation, typeSpeed);
    }
    
    typeAnimation();

    // --- Scroll-triggered Animations ---
    // Animate Hero Section on load
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTimeline
        .from('#hero h1', { opacity: 0, y: 30, duration: 0.8 })
        .from('#hero h2', { opacity: 0, y: 30, duration: 0.8 }, '-=0.6')
        .from('#hero p', { opacity: 0, y: 20, duration: 0.6 }, '-=0.6')
        .from('#hero .flex a', { opacity: 0, y: 20, duration: 0.5, stagger: 0.2 }, '-=0.4')
        .from('#hero .relative', { opacity: 0, scale: 0.9, duration: 0.8 }, '-=0.8');

    // Animate all other sections on scroll
    gsap.utils.toArray('section:not(#hero)').forEach(section => {
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });

        timeline.from(section.querySelector('h2'), { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' });

        if (section.id === 'about') {
            timeline.from('.about-text-content p', { opacity: 0, y: 20, stagger: 0.2, duration: 0.5 }, '-=0.3');
            timeline.from('.about-cards > div', { opacity: 0, x: 30, stagger: 0.2, duration: 0.5 }, '-=0.4');
        } else {
            timeline.from(section.querySelectorAll('.grid > *, .flex > *'), {
                opacity: 0,
                y: 40,
                stagger: 0.1,
                duration: 0.5
            }, '-=0.3');
        }
    });

});

