// Premium Portfolio - Motion System
document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. REDUCED MOTION CHECK ─────────────────────────────────────────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    // ─── 2. GSAP + SCROLLTRIGGER SETUP ───────────────────────────────────
    try {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        } else {
            console.warn('GSAP or ScrollTrigger library not loaded.');
        }
    } catch (e) {
        console.error('Failed to register GSAP ScrollTrigger:', e);
    }

    // ─── 3. LENIS SMOOTH SCROLL ──────────────────────────────────────────
    let lenis = null;
    try {
        if (typeof Lenis !== 'undefined') {
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 2,
            });

            // Connect Lenis to GSAP ticker
            if (typeof gsap !== 'undefined') {
                gsap.ticker.add((time) => {
                    lenis.raf(time * 1000);
                });
                gsap.ticker.lagSmoothing(0);
            }

            // Sync Lenis scroll with ScrollTrigger
            if (typeof ScrollTrigger !== 'undefined') {
                lenis.on('scroll', ScrollTrigger.update);
            }
        } else {
            console.warn('Lenis smooth scroll library not loaded.');
        }
    } catch (e) {
        console.error('Failed to initialize Lenis:', e);
    }

    // ─── 4. SCROLL PROGRESS BAR ──────────────────────────────────────────
    const scrollProgressBar = document.getElementById('scroll-progress');

    function updateScrollProgress() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = (scrollY / (docHeight - winHeight)) * 100;
        if (scrollProgressBar) {
            scrollProgressBar.style.width = scrollPercent + '%';
        }
    }

    // ─── 5. NAV SCROLL STATE ─────────────────────────────────────────────
    const navElement = document.querySelector('nav');

    function updateNavScrollState() {
        if (!navElement) return;
        if (window.scrollY > 50) {
            navElement.classList.add('nav-scrolled');
        } else {
            navElement.classList.remove('nav-scrolled');
        }
    }

    // Combined scroll listener for progress + nav state (passive for performance)
    window.addEventListener('scroll', () => {
        updateScrollProgress();
        updateNavScrollState();
    }, { passive: true });

    // Initial call
    updateScrollProgress();
    updateNavScrollState();

    // ─── 6. MOUSE GLOW + 3D TILT ON CARDS ───────────────────────────────
    const glowCards = document.querySelectorAll('.glow-card');

    if (!isTouchDevice) {
        glowCards.forEach((card) => {
            let rafId = null;
            let rect = null;

            card.addEventListener('mouseenter', () => {
                rect = card.getBoundingClientRect();
            });

            card.addEventListener('mousemove', (e) => {
                if (!rect) {
                    rect = card.getBoundingClientRect();
                }
                const clientX = e.clientX;
                const clientY = e.clientY;

                if (rafId) return; // throttle with rAF

                rafId = requestAnimationFrame(() => {
                    const x = clientX - rect.left;
                    const y = clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Set CSS custom properties for radial gradient glow
                    card.style.setProperty('--mouse-x', x + 'px');
                    card.style.setProperty('--mouse-y', y + 'px');

                    // 3D tilt (only if animations are enabled)
                    if (!prefersReducedMotion) {
                        const rotateX = ((y - centerY) / centerY) * -5;
                        const rotateY = ((x - centerX) / centerX) * 5;

                        if (typeof gsap !== 'undefined') {
                            gsap.to(card, {
                                rotateX: rotateX,
                                rotateY: rotateY,
                                scale: 1.03,
                                y: -5,
                                duration: 0.5,
                                ease: 'power2.out',
                                transformPerspective: 800,
                                transformOrigin: 'center center',
                            });
                        } else {
                            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03) translateY(-5px)`;
                            card.style.transition = 'transform 0.2s ease-out';
                        }
                    }

                    rafId = null;
                });
            });

            card.addEventListener('mouseleave', () => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
                rect = null; // Clear cache

                if (!prefersReducedMotion) {
                    if (typeof gsap !== 'undefined') {
                        gsap.to(card, {
                            rotateX: 0,
                            rotateY: 0,
                            scale: 1,
                            y: 0,
                            duration: 0.7,
                            ease: 'elastic.out(1, 0.3)',
                        });
                    } else {
                        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)';
                        card.style.transition = 'transform 0.5s ease-out';
                    }
                }
            });
        });
    }

    // ─── 7. CUSTOM CURSOR ────────────────────────────────────────────────
    const cursor = document.getElementById('custom-cursor');
    const cursorFollower = document.getElementById('custom-cursor-follower');

    if (cursor && cursorFollower && !isTouchDevice) {
        let mouseX = 0;
        let mouseY = 0;
        let followerX = 0;
        let followerY = 0;
        const lerpFactor = 0.15;

        // Show cursors
        cursor.style.opacity = '1';
        cursorFollower.style.opacity = '1';
        document.body.style.cursor = 'none';

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Cursor follows instantly
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        // Follower uses GSAP ticker for smooth lag
        if (typeof gsap !== 'undefined') {
            gsap.ticker.add(() => {
                followerX += (mouseX - followerX) * lerpFactor;
                followerY += (mouseY - followerY) * lerpFactor;

                cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
            });
        } else {
            function updateFollower() {
                followerX += (mouseX - followerX) * lerpFactor;
                followerY += (mouseY - followerY) * lerpFactor;

                cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
                requestAnimationFrame(updateFollower);
            }
            requestAnimationFrame(updateFollower);
        }

        // Hover states for interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .glow-card');

        hoverTargets.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursorFollower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorFollower.classList.remove('hover');
            });
        });
    } else {
        // Hide custom cursor on touch devices
        if (cursor) cursor.style.display = 'none';
        if (cursorFollower) cursorFollower.style.display = 'none';
    }

    // ─── 8. NAV PILL INDICATOR ───────────────────────────────────────────
    const navPill = document.getElementById('nav-pill');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateNavPill() {
        if (!navPill) return;

        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            const parent = activeLink.parentElement;
            const parentRect = parent.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();

            // Calculate offset relative to the parent container
            const offsetLeft = linkRect.left - parentRect.left + parent.scrollLeft;
            const linkWidth = linkRect.width;

            navPill.style.left = offsetLeft + 'px';
            navPill.style.width = linkWidth + 'px';
            navPill.style.opacity = '1';
        } else {
            navPill.style.opacity = '0';
        }
    }

    // Initial pill position
    updateNavPill();

    // ─── 9. ACTIVE NAV LINK DETECTION ────────────────────────────────────
    const sections = document.querySelectorAll('section[id]');

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                    updateNavPill();
                }
            });
        },
        {
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0,
        }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    // ─── 10. SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                if (lenis) {
                    lenis.scrollTo(targetElement, {
                        offset: 0,
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    });
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }

            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // ─── 11. PARALLAX BACKGROUNDS ────────────────────────────────────────
    // Background mesh elements (grid, ambient layers, and noise) now run 
    // highly optimized GPU drift keyframes via CSS compositor thread, 
    // avoiding layout overrides on the JS main thread.
    // ─────────────────────────────────────────────────────────────────────

    // ─── 12. HERO ANIMATION SEQUENCE ─────────────────────────────────────
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        const heroTimeline = gsap.timeline({
            defaults: { ease: 'expo.out' },
        });

        heroTimeline
            .from('.hero-glow', {
                scale: 0,
                opacity: 0,
                duration: 2,
            }, 0)
            .from('.hero-badge', {
                opacity: 0,
                y: 30,
                duration: 1.2,
                delay: 0.3,
            })
            .from('.hero-title-line', {
                opacity: 0,
                y: 60,
                stagger: 0.15,
                duration: 1.4,
            }, '-=0.9')
            .from('.hero-desc', {
                opacity: 0,
                y: 25,
                duration: 1.2,
            }, '-=0.8')
            .from('.hero-cta', {
                opacity: 0,
                y: 15,
                scale: 0.95,
                stagger: 0.1,
                duration: 1,
            }, '-=0.7')
            .from('.hero-profile-img', {
                opacity: 0,
                scale: 0.9,
                duration: 1.5,
            }, '-=1.2');
    }

    // ─── 13. HERO PROFILE IMAGE MOUSE PARALLAX ──────────────────────────
    if (!prefersReducedMotion && !isTouchDevice) {
        const heroProfileImg = document.querySelector('.hero-profile-img');

        if (heroProfileImg) {
            let heroRafId = null;

            document.addEventListener('mousemove', (e) => {
                if (heroRafId) return;

                heroRafId = requestAnimationFrame(() => {
                    const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
                    const moveY = (e.clientY - window.innerHeight / 2) * 0.02;

                    if (typeof gsap !== 'undefined') {
                        gsap.to(heroProfileImg, {
                            x: moveX,
                            y: moveY,
                            duration: 1,
                            ease: 'power2.out',
                        });
                    } else {
                        heroProfileImg.style.transform = `translate(${moveX}px, ${moveY}px)`;
                        heroProfileImg.style.transition = 'transform 0.2s ease-out';
                    }

                    heroRafId = null;
                });
            });
        }
    }

    // ─── 14. SECTION SCROLL REVEALS ──────────────────────────────────────
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        // Reveal-up elements
        const revealElements = document.querySelectorAll('.reveal-up');
        revealElements.forEach((elem) => {
            gsap.from(elem, {
                scrollTrigger: {
                    trigger: elem,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
                opacity: 0,
                y: 60,
                duration: 1,
                ease: 'expo.out',
                clearProps: 'all',
            });
        });

        // Stagger-grid elements
        const staggerGrids = document.querySelectorAll('.stagger-grid');
        staggerGrids.forEach((grid) => {
            gsap.from(grid.children, {
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
                opacity: 0,
                y: 50,
                scale: 0.95,
                stagger: 0.1,
                duration: 0.9,
                ease: 'back.out(1.4)',
                clearProps: 'all',
            });
        });
    }

    // ─── 15. STAT COUNTER ANIMATION ──────────────────────────────────────
    const statCounters = document.querySelectorAll('.stat-counter[data-count]');

    if (statCounters.length > 0) {
        if (typeof gsap !== 'undefined') {
            const counterObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const el = entry.target;
                            const target = parseInt(el.getAttribute('data-count'), 10);

                            if (isNaN(target)) return;

                            const obj = { val: 0 };
                            gsap.to(obj, {
                                val: target,
                                duration: 2,
                                ease: 'power2.out',
                                onUpdate: () => {
                                    el.textContent = Math.floor(obj.val) + '+';
                                },
                            });

                            observer.unobserve(el);
                        }
                    });
                },
                { threshold: 0.15 }
            );

            statCounters.forEach((counter) => counterObserver.observe(counter));
        } else {
            // GSAP fallback: immediately display the target values
            statCounters.forEach((el) => {
                const target = parseInt(el.getAttribute('data-count'), 10);
                if (!isNaN(target)) {
                    el.textContent = target + '+';
                }
            });
        }
    }

    // ─── 16. TYPING EFFECT ───────────────────────────────────────────────
    const roleTextElement = document.getElementById('role-text');

    if (roleTextElement) {
        const roles = [
            'Software Engineer.',
            'Competitive Programmer.',
            'Backend Systems Specialist.',
        ];

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const typeSpeed = 80;
        const deleteSpeed = 40;
        const pauseAfterType = 2000;
        const pauseAfterDelete = 500;

        function typeEffect() {
            const currentRole = roles[roleIndex];

            if (isDeleting) {
                charIndex--;
                roleTextElement.textContent = currentRole.substring(0, charIndex);

                if (charIndex === 0) {
                    isDeleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(typeEffect, pauseAfterDelete);
                } else {
                    setTimeout(typeEffect, deleteSpeed);
                }
            } else {
                charIndex++;
                roleTextElement.textContent = currentRole.substring(0, charIndex);

                if (charIndex === currentRole.length) {
                    isDeleting = true;
                    setTimeout(typeEffect, pauseAfterType);
                } else {
                    setTimeout(typeEffect, typeSpeed);
                }
            }
        }

        // Start typing after 1.5s delay
        setTimeout(typeEffect, 1500);
    }

    // ─── 17. LIVE CONTEST TELEMETRY & DASHBOARD ──────────────────────────
    const fallbackData = {
        cf: {
            rating: 1864,
            rank: 'Expert',
            maxRating: 2000,
            maxRank: 'Candidate Master',
            solved: 307,
            handle: 'SumitXorY',
            contests: [
                { name: 'Codeforces Round 1079 (Div. 2)', rank: 809, change: -87, rating: 1864 },
                { name: 'Codeforces Round 1078 (Div. 2)', rank: 270, change: 46, rating: 1951 },
                { name: 'Codeforces Round 1079 (Div. 1 + Div. 2)', rank: 132, change: 107, rating: 1905 },
                { name: 'Hello 2026', rank: 10931, change: -202, rating: 1798 }
            ]
        },
        lc: {
            rating: 1898,
            rank: 'Knight',
            solved: 729,
            totalQuestions: 3100,
            easySolved: 200,
            easyTotal: 820,
            mediumSolved: 438,
            mediumTotal: 1620,
            hardSolved: 91,
            hardTotal: 660,
            acceptanceRate: 54.2,
            ranking: 37964,
            handle: 'sumit_chauhan_'
        },
        cc: {
            rating: 2070,
            stars: '5 ★',
            maxRating: 2070,
            globalRank: 912,
            countryRank: 610,
            solved: 175,
            handle: 'gosling_dude'
        },
        gfg: {
            score: 1491,
            solved: 438,
            rank: 155,
            streak: 202,
            handle: 'sumit_chauhan143'
        }
    };

    const CACHE_KEY = 'portfolio_telemetry_cache_v3';
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    function getCache() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;
            const data = JSON.parse(cached);
            const age = Date.now() - data.timestamp;
            if (age < CACHE_TTL && data.payload && data.payload.gfg) {
                return data.payload;
            }
        } catch (e) {
            console.error('Error reading telemetry cache', e);
        }
        return null;
    }

    function setCache(payload) {
        try {
            const cacheData = {
                timestamp: Date.now(),
                payload: payload
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (e) {
            console.error('Error writing telemetry cache', e);
        }
    }

    function capitalizeCF(str) {
        if (!str) return '';
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function renderTelemetry(data) {
        // 1. Codeforces Rendering
        const cfRatingEl = document.getElementById('cf-rating');
        const cfRankEl = document.getElementById('cf-rank');
        const cfMaxRatingEl = document.getElementById('cf-max-rating');
        const cfMaxRankEl = document.getElementById('cf-max-rank');
        const cfSolvedEl = document.getElementById('cf-solved');
        const cfContestsBody = document.getElementById('cf-contests-body');

        if (cfRatingEl) cfRatingEl.textContent = data.cf.rating;
        if (cfRankEl) cfRankEl.textContent = capitalizeCF(data.cf.rank);
        if (cfMaxRatingEl) cfMaxRatingEl.textContent = data.cf.maxRating;
        if (cfMaxRankEl) cfMaxRankEl.textContent = capitalizeCF(data.cf.maxRank);
        if (cfSolvedEl) cfSolvedEl.textContent = `${data.cf.solved}+`;

        if (cfContestsBody && data.cf.contests) {
            cfContestsBody.innerHTML = '';
            data.cf.contests.forEach(c => {
                const changeClass = c.change >= 0 ? 'text-emerald-400' : 'text-rose-400';
                const changeSign = c.change >= 0 ? `+${c.change}` : `${c.change}`;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-3 text-gray-300 font-medium">${c.name}</td>
                    <td class="p-3 text-center font-mono text-gray-400">${c.rank}</td>
                    <td class="p-3 text-center font-mono ${changeClass}">${changeSign}</td>
                    <td class="p-3 text-center font-mono font-bold text-white">${c.rating}</td>
                `;
                cfContestsBody.appendChild(tr);
            });
        }

        // 2. LeetCode Rendering
        const lcRatingEl = document.getElementById('lc-rating');
        const lcRankEl = document.getElementById('lc-rank');
        const lcRankingEl = document.getElementById('lc-ranking');
        const lcRankingExactEl = document.getElementById('lc-ranking-exact');
        const lcSolvedEl = document.getElementById('lc-solved');
        const lcAcceptanceEl = document.getElementById('lc-acceptance');

        const lcEasyCountEl = document.getElementById('lc-easy-count');
        const lcMediumCountEl = document.getElementById('lc-medium-count');
        const lcHardCountEl = document.getElementById('lc-hard-count');

        const lcRating = data.lc.rating;
        let lcRank = 'Knight';
        if (lcRating >= 2190) lcRank = 'Guardian';
        else if (lcRating >= 1850) lcRank = 'Knight';
        else if (lcRating >= 1600) lcRank = 'Specialist';
        else lcRank = 'Coder';

        const easyTotal = data.lc.easyTotal || 820;
        const mediumTotal = data.lc.mediumTotal || 1620;
        const hardTotal = data.lc.hardTotal || 660;

        if (lcRatingEl) lcRatingEl.textContent = lcRating;
        if (lcRankEl) lcRankEl.textContent = lcRank;
        if (lcSolvedEl) lcSolvedEl.textContent = `${data.lc.solved} / ${easyTotal + mediumTotal + hardTotal}`;
        if (lcAcceptanceEl) lcAcceptanceEl.textContent = `Acceptance: ${data.lc.acceptanceRate}%`;

        if (lcRankingEl) {
            if (data.lc.ranking && typeof data.lc.ranking === 'number') {
                if (data.lc.ranking < 3000000) {
                    lcRankingEl.textContent = `Top ${((data.lc.ranking / 3000000) * 100).toFixed(1)}%`;
                } else {
                    lcRankingEl.textContent = 'Top 2.5%';
                }
            } else {
                lcRankingEl.textContent = 'Top 2.5%';
            }
        }
        if (lcRankingExactEl) {
            lcRankingExactEl.textContent = data.lc.ranking && typeof data.lc.ranking === 'number'
                ? `Rank #${data.lc.ranking.toLocaleString()}`
                : `Rank #${data.lc.ranking || 'N/A'}`;
        }

        if (lcEasyCountEl) lcEasyCountEl.textContent = `${data.lc.easySolved} / ${easyTotal}`;
        if (lcMediumCountEl) lcMediumCountEl.textContent = `${data.lc.mediumSolved} / ${mediumTotal}`;
        if (lcHardCountEl) lcHardCountEl.textContent = `${data.lc.hardSolved} / ${hardTotal}`;

        const easyBar = document.getElementById('lc-easy-bar');
        const mediumBar = document.getElementById('lc-medium-bar');
        const hardBar = document.getElementById('lc-hard-bar');

        if (easyBar) easyBar.style.width = `${(data.lc.easySolved / easyTotal) * 100}%`;
        if (mediumBar) mediumBar.style.width = `${(data.lc.mediumSolved / mediumTotal) * 100}%`;
        if (hardBar) hardBar.style.width = `${(data.lc.hardSolved / hardTotal) * 100}%`;

        // 3. CodeChef Rendering
        const ccRatingEl = document.getElementById('cc-rating');
        const ccStarsEl = document.getElementById('cc-stars');
        const ccMaxRatingEl = document.getElementById('cc-max-rating');
        const ccGlobalRankEl = document.getElementById('cc-global-rank');
        const ccCountryRankEl = document.getElementById('cc-country-rank');
        const ccStarsDisplayEl = document.getElementById('cc-stars-display');
        const ccSolvedEl = document.getElementById('cc-solved');

        if (ccRatingEl) ccRatingEl.textContent = data.cc.rating;
        if (ccStarsEl) ccStarsEl.textContent = `${data.cc.stars} (${data.cc.rating >= 2000 ? 'Div 1' : 'Div 2'})`;
        if (ccMaxRatingEl) ccMaxRatingEl.textContent = data.cc.maxRating;
        if (ccGlobalRankEl) ccGlobalRankEl.textContent = data.cc.globalRank;
        if (ccCountryRankEl) ccCountryRankEl.textContent = data.cc.countryRank;
        if (ccStarsDisplayEl) ccStarsDisplayEl.textContent = data.cc.stars;
        if (ccSolvedEl) ccSolvedEl.textContent = `${data.cc.solved}+`;

        // 3.5. GeeksforGeeks Rendering
        const gfgScoreEl = document.getElementById('gfg-score');
        const gfgSolvedEl = document.getElementById('gfg-solved');
        const gfgRankEl = document.getElementById('gfg-rank');
        const gfgStreakEl = document.getElementById('gfg-streak');
        const gfgProfileScoreEl = document.getElementById('gfg-profile-score');

        if (gfgScoreEl) gfgScoreEl.textContent = data.gfg.score;
        if (gfgSolvedEl) gfgSolvedEl.textContent = data.gfg.solved;
        if (gfgRankEl) gfgRankEl.textContent = data.gfg.rank;
        if (gfgStreakEl) gfgStreakEl.textContent = `${data.gfg.streak} days`;
        if (gfgProfileScoreEl) gfgProfileScoreEl.textContent = data.gfg.score;

        // 4. Update the Achievements Stat Counter data-count attribute
        const totalSolved = parseInt(data.cf.solved, 10) + parseInt(data.lc.solved, 10) + parseInt(data.cc.solved, 10) + parseInt(data.gfg.solved, 10);
        const achievementsCounter = document.querySelector('.stat-counter');
        if (achievementsCounter && !isNaN(totalSolved)) {
            const oldTarget = parseInt(achievementsCounter.getAttribute('data-count'), 10) || 0;
            achievementsCounter.setAttribute('data-count', totalSolved);
            
            // In case IntersectionObserver was triggered or is touch/reduced-motion:
            if (prefersReducedMotion || isTouchDevice) {
                achievementsCounter.textContent = `${totalSolved}+`;
            } else {
                const currentTextVal = parseInt(achievementsCounter.textContent.replace('+', ''), 10) || 0;
                if (currentTextVal > 0 && currentTextVal !== totalSolved) {
                    const animObj = { val: currentTextVal };
                    gsap.to(animObj, {
                        val: totalSolved,
                        duration: 1.5,
                        ease: 'power2.out',
                        onUpdate: () => {
                            achievementsCounter.textContent = Math.floor(animObj.val) + '+';
                        }
                    });
                } else if (currentTextVal === 0) {
                    // Let the IntersectionObserver handle the initial entrance count-up
                }
            }
        }
    }

    async function updateTelemetry() {
        const loader = document.getElementById('dashboard-loader');
        if (loader) loader.classList.add('active');

        const syncBtn = document.getElementById('telemetry-sync-btn');
        if (syncBtn) syncBtn.classList.add('syncing-active');

        // Check cache first
        const cachedData = getCache();
        if (cachedData) {
            console.log('Using cached coding telemetry data:', cachedData);
            renderTelemetry(cachedData);
            if (loader) loader.classList.remove('active');
            if (syncBtn) syncBtn.classList.remove('syncing-active');
            return;
        }

        console.log('Fetching live telemetry from coding profiles...');
        
        const telemetry = {
            cf: { ...fallbackData.cf },
            lc: { ...fallbackData.lc },
            cc: { ...fallbackData.cc },
            gfg: { ...fallbackData.gfg }
        };

        // Render fallbackData instantly so the user never sees wrong mock data or 0 solved problems
        renderTelemetry(telemetry);

        const promises = [];

        // 1. Codeforces API 1: User Info (via CORS proxy)
        promises.push(
            fetch('https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://codeforces.com/api/user.info?handles=SumitXorY'))
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'OK' && data.result && data.result[0]) {
                        const user = data.result[0];
                        telemetry.cf.rating = user.rating || telemetry.cf.rating;
                        telemetry.cf.rank = user.rank || telemetry.cf.rank;
                        telemetry.cf.maxRating = user.maxRating || telemetry.cf.maxRating;
                        telemetry.cf.maxRank = user.maxRank || telemetry.cf.maxRank;
                        renderTelemetry(telemetry);
                        setCache(telemetry);
                    }
                })
                .catch(err => console.warn('CF Info API failed, using fallback:', err))
        );

        // 2. Codeforces API 2: Submissions (Unique Solved Count) (via CORS proxy)
        promises.push(
            fetch('https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://codeforces.com/api/user.status?handle=SumitXorY'))
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'OK' && data.result) {
                        const uniqueProblems = new Set();
                        data.result.forEach(sub => {
                            if (sub.verdict === 'OK' && sub.problem) {
                                const pId = sub.problem.contestId ? `${sub.problem.contestId}-${sub.problem.index}` : sub.problem.name;
                                uniqueProblems.add(pId);
                            }
                        });
                        if (uniqueProblems.size > 0) {
                            telemetry.cf.solved = uniqueProblems.size;
                            renderTelemetry(telemetry);
                            setCache(telemetry);
                        }
                    }
                })
                .catch(err => console.warn('CF Solved API failed, using fallback:', err))
        );

        // 3. Codeforces API 3: Rating history (via CORS proxy)
        promises.push(
            fetch('https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://codeforces.com/api/user.rating?handle=SumitXorY'))
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'OK' && data.result && data.result.length > 0) {
                        const history = data.result;
                        const recent = history.slice(-4).reverse(); // last 4 contests
                        telemetry.cf.contests = recent.map(c => ({
                            name: c.contestName,
                            rank: c.rank,
                            change: c.newRating - c.oldRating,
                            rating: c.newRating
                        }));
                        renderTelemetry(telemetry);
                        setCache(telemetry);
                    }
                })
                .catch(err => console.warn('CF Rating API failed, using fallback:', err))
        );

        // 4. LeetCode Stats API (Solved and Contest stats in parallel)
        promises.push(
            Promise.all([
                fetch('https://alfa-leetcode-api.onrender.com/sumit_chauhan_/solved').then(res => res.json()),
                fetch('https://alfa-leetcode-api.onrender.com/sumit_chauhan_/contest').then(res => res.json())
            ])
            .then(([solvedData, contestData]) => {
                let updated = false;
                if (solvedData && solvedData.solvedProblem) {
                    telemetry.lc.solved = solvedData.solvedProblem;
                    telemetry.lc.easySolved = solvedData.easySolved;
                    telemetry.lc.mediumSolved = solvedData.mediumSolved;
                    telemetry.lc.hardSolved = solvedData.hardSolved;
                    updated = true;
                }
                if (contestData && contestData.contestRating) {
                    telemetry.lc.rating = Math.round(contestData.contestRating);
                    telemetry.lc.ranking = contestData.contestGlobalRanking;
                    telemetry.lc.rank = contestData.contestBadges?.name || telemetry.lc.rank;
                    updated = true;
                }
                if (updated) {
                    renderTelemetry(telemetry);
                    setCache(telemetry);
                }
            })
            .catch(err => console.warn('LeetCode API failed, using fallback:', err))
        );

        // 5. CodeChef Client-side Scraper
        promises.push(
            fetch('https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://www.codechef.com/users/gosling_dude'))
                .then(res => res.text())
                .then(html => {
                    if (html && html.length > 200) {
                        const ratingMatch = html.match(/rating-number[^>]*>\s*(\d+)/) || html.match(/rating-block-all.*?rating-number[^>]*>\s*(\d+)/s);
                        const maxRatingMatch = html.match(/Highest Rating\s*(\d+)/) || html.match(/Highest Rating[^<]*?(\d+)/);
                        const starsMatch = html.match(/class="rating-star"[^>]*>([\s\S]*?)<\/div>/);
                        const globalRankMatch = html.match(/href="\/ratings\/all"[^>]*>\s*<strong>\s*(\d+)/) || html.match(/href="\/ratings\/all"[^>]*>\s*<strong>\s*(\d+)/s);
                        const countryRankMatch = html.match(/filterBy=Country[^>]*>\s*<strong>\s*(\d+)/) || html.match(/filterBy=Country[^>]*>\s*<strong>\s*(\d+)/s);
                        const solvedMatch = html.match(/Total Problems Solved:\s*(\d+)/i) || html.match(/Fully Solved\s*\((\d+)\)/i) || html.match(/Practice\s*\((\d+)\)/i);

                        let updated = false;
                        if (ratingMatch) { telemetry.cc.rating = parseInt(ratingMatch[1], 10); updated = true; }
                        if (maxRatingMatch) { telemetry.cc.maxRating = parseInt(maxRatingMatch[1], 10); updated = true; }
                        if (starsMatch) {
                            const numStars = (starsMatch[1].match(/&#9733;/g) || []).length;
                            if (numStars > 0) { telemetry.cc.stars = `${numStars} ★`; updated = true; }
                        }
                        if (globalRankMatch) { telemetry.cc.globalRank = parseInt(globalRankMatch[1], 10); updated = true; }
                        if (countryRankMatch) { telemetry.cc.countryRank = parseInt(countryRankMatch[1], 10); updated = true; }
                        if (solvedMatch) { telemetry.cc.solved = parseInt(solvedMatch[1], 10); updated = true; }

                        if (updated) {
                            renderTelemetry(telemetry);
                            setCache(telemetry);
                        }
                    }
                })
                .catch(err => console.warn('CodeChef Scraping failed, using fallback:', err))
        );

        // 6. GeeksforGeeks Client-side Scraper
        promises.push(
            fetch('https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://www.geeksforgeeks.org/user/sumit_chauhan143/'))
                .then(res => res.text())
                .then(html => {
                    if (html && html.length > 200) {
                        const scoreMatch = html.match(/score\\?":\s*(\d+)/);
                        const solvedMatch = html.match(/total_problems_solved\\?":\s*(\d+)/);
                        const rankMatch = html.match(/institute_rank\\?":\s*(\d+)/);
                        const streakMatch = html.match(/pod_solved_longest_streak\\?":\s*(\d+)/);

                        let updated = false;
                        if (scoreMatch) { telemetry.gfg.score = parseInt(scoreMatch[1], 10); updated = true; }
                        if (solvedMatch) { telemetry.gfg.solved = parseInt(solvedMatch[1], 10); updated = true; }
                        if (rankMatch) { telemetry.gfg.rank = parseInt(rankMatch[1], 10); updated = true; }
                        if (streakMatch) { telemetry.gfg.streak = parseInt(streakMatch[1], 10); updated = true; }

                        if (updated) {
                            renderTelemetry(telemetry);
                            setCache(telemetry);
                        }
                    }
                })
                .catch(err => console.warn('GFG Scraping failed, using fallback:', err))
        );

        await Promise.allSettled(promises);

        setCache(telemetry);
        renderTelemetry(telemetry);

        if (loader) loader.classList.remove('active');
        if (syncBtn) syncBtn.classList.remove('syncing-active');
    }

    // Tab Switching Interaction
    function switchDashboardTab(platform) {
        const tabs = ['cf', 'lc', 'cc', 'gfg'];
        
        tabs.forEach(tab => {
            const btn = document.getElementById(`db-tab-${tab}`);
            const panel = document.getElementById(`db-panel-${tab}`);
            
            if (tab === platform) {
                if (btn) btn.className = "dashboard-tab-btn px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all text-white bg-white/10 flex items-center justify-center gap-2 whitespace-nowrap flex-1 lg:flex-none active";
                if (panel) panel.classList.remove('hidden');
                
                // Re-trigger progress bar widths for LC tab animations
                if (platform === 'lc') {
                    const easyBar = document.getElementById('lc-easy-bar');
                    const mediumBar = document.getElementById('lc-medium-bar');
                    const hardBar = document.getElementById('lc-hard-bar');
                    if (easyBar) {
                        const w = easyBar.style.width;
                        easyBar.style.width = '0%';
                        setTimeout(() => easyBar.style.width = w, 50);
                    }
                    if (mediumBar) {
                        const w = mediumBar.style.width;
                        mediumBar.style.width = '0%';
                        setTimeout(() => mediumBar.style.width = w, 50);
                    }
                    if (hardBar) {
                        const w = hardBar.style.width;
                        hardBar.style.width = '0%';
                        setTimeout(() => hardBar.style.width = w, 50);
                    }
                }
            } else {
                if (btn) btn.className = "dashboard-tab-btn px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all text-gray-400 hover:text-white flex items-center justify-center gap-2 whitespace-nowrap flex-1 lg:flex-none";
                if (panel) panel.classList.add('hidden');
            }
        });
    }

    // Attach Tab Button Listeners and Sync Button
    const tabCf = document.getElementById('db-tab-cf');
    const tabLc = document.getElementById('db-tab-lc');
    const tabCc = document.getElementById('db-tab-cc');
    const tabGfg = document.getElementById('db-tab-gfg');
    const syncBtn = document.getElementById('telemetry-sync-btn');

    if (tabCf) tabCf.addEventListener('click', () => switchDashboardTab('cf'));
    if (tabLc) tabLc.addEventListener('click', () => switchDashboardTab('lc'));
    if (tabCc) tabCc.addEventListener('click', () => switchDashboardTab('cc'));
    if (tabGfg) tabGfg.addEventListener('click', () => switchDashboardTab('gfg'));

    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            // Clear cache
            localStorage.removeItem(CACHE_KEY);
            console.log('Telemetry cache cleared manually by user.');
            // Re-fetch telemetry
            updateTelemetry();
        });
    }

    // Trigger on page load
    updateTelemetry();
});