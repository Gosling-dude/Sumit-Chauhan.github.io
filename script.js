// Custom script for advanced portfolio animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // --- Smooth Scrolling ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- Mouse Glow Effect (Glowing Cards) ---
    document.getElementById('cards-container').onmousemove = e => {
        for(const card of document.getElementsByClassName("glow-card")) {
          const rect = card.getBoundingClientRect(),
                x = e.clientX - rect.left,
                y = e.clientY - rect.top;
      
          card.style.setProperty("--mouse-x", `${x}px`);
          card.style.setProperty("--mouse-y", `${y}px`);
        };
    }

    // --- Active Nav Link Update ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href').substring(1) === entry.target.id);
                });
            }
        });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(section => sectionObserver.observe(section));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            e.preventDefault();
            document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
        });
    });


    // --- Advanced GSAP Scroll Animations ---

    // Hero Section Reveal
    const heroTimeline = gsap.timeline({ defaults: { ease: 'expo.out' } });
    heroTimeline
        .from('.hero-badge', { opacity: 0, y: 20, duration: 1, delay: 0.2 })
        .from('.hero-title-line', { opacity: 0, y: 40, stagger: 0.15, duration: 1.2 }, '-=0.8')
        .from('.hero-desc', { opacity: 0, y: 20, duration: 1 }, '-=0.8')
        .from('.hero-cta', { opacity: 0, scale: 0.95, y: 10, stagger: 0.1, duration: 0.8 }, '-=0.6');


    // Generic Reveal for Sections
    gsap.utils.toArray('.reveal-up').forEach(elem => {
        gsap.from(elem, {
            scrollTrigger: {
                trigger: elem,
                start: 'top 85%',
                toggleActions: 'play none none none' // Only play once
            },
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'expo.out'
        });
    });

    // Staggered Reveal for Grid Items
    gsap.utils.toArray('.stagger-grid').forEach(grid => {
        gsap.from(grid.children, {
            scrollTrigger: {
                trigger: grid,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.8,
            ease: 'back.out(1.2)'
        });
    });

    // --- Hero Text Typing Effect (Reimplemented for new UI) ---
    const roleText = document.getElementById('role-text');
    if(roleText) {
        const roles = ["Software Engineer.", "Competitive Programmer.", "Backend Systems Specialist."];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function type() {
            const currentRole = roles[roleIndex];
            if (isDeleting) charIndex--;
            else charIndex++;
    
            roleText.textContent = currentRole.substring(0, charIndex);
    
            let typeSpeed = isDeleting ? 30 : 80;
    
            if (!isDeleting && charIndex === currentRole.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typeSpeed = 500;
            }
            setTimeout(type, typeSpeed);
        }
        setTimeout(type, 1500); // start after hero animation
    }
});