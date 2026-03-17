/**
 * Hyper-Futuristic Portfolio - Logic Core
 * Author: Chethan Gowda (AI Architected)
 * Tech: Vanilla JS, requestAnimationFrame, Canvas HTML5, CSS Variables
 */

// ============================================================================
// Globals & Utils
// ============================================================================
const lerp = (a, b, n) => (1 - n) * a + n * b;
const getMousePos = (e) => ({ x: e.clientX, y: e.clientY });
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0 };
let lastMouse = { x: mouse.x, y: mouse.y };

window.addEventListener('mousemove', (e) => {
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.vx = mouse.x - lastMouse.x;
    mouse.vy = mouse.y - lastMouse.y;
});

let isMobile = window.innerWidth <= 768;
window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
});

// ============================================================================
// Custom Magnetic Cursor
// ============================================================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let cursor = { x: mouse.x, y: mouse.y };
let ringCursor = { x: mouse.x, y: mouse.y };

// Magnet Targets
const magnetics = document.querySelectorAll('a, button, .card-magnetic, .mech-input');

magnetics.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        cursorDot.classList.add('hover-magnetic');
        cursorRing.classList.add('hover-magnetic');
        
        // Calculate size of target to swallow it
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const radius = style.borderRadius !== '0px' ? style.borderRadius : '8px';
        
        cursorRing.style.setProperty('--hover-width', `${rect.width + 10}px`);
        cursorRing.style.setProperty('--hover-height', `${rect.height + 10}px`);
        cursorRing.style.setProperty('--hover-radius', radius);
    });

    el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover-magnetic');
        cursorRing.classList.remove('hover-magnetic');
        cursorRing.style.width = '40px';
        cursorRing.style.height = '40px';
        cursorRing.style.borderRadius = '50%';
        cursorRing.style.transform = `translate(-50%, -50%)`;
    });
});

// Mechanical Typing Click Feedback
const inputs = document.querySelectorAll('.mech-input');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        cursorRing.style.transform = `translate(-50%, -50%) scale(0.9)`;
        setTimeout(() => {
            cursorRing.style.transform = `translate(-50%, -50%) scale(1)`;
        }, 50);
    });
});

// ============================================================================
// Kinetic Smooth Scroll & Scroll Velocity Distortion
// ============================================================================
const body = document.body;
const smoothWrapper = document.getElementById('smooth-wrapper');
const smoothContent = document.getElementById('smooth-content');
let scroll = { current: 0, target: 0, rounded: 0, velocity: 0 };

// Set body height based on content
function setBodyHeight() {
    body.style.height = `${smoothContent.offsetHeight}px`;
}
window.addEventListener('resize', setBodyHeight);
setTimeout(setBodyHeight, 500); // init

window.addEventListener('scroll', () => {
    scroll.target = window.scrollY;
});

// HUD Indication
const hudIndicator = document.querySelector('.hud-indicator');
const sections = document.querySelectorAll('.section');
const hudLinks = document.querySelectorAll('.hud-link');

function updateHUD() {
    // Find active section based on scroll
    let activeIndex = 0;
    sections.forEach((sec, index) => {
        const rect = sec.getBoundingClientRect();
        // If the top of the section is somewhat above the middle of the screen
        if (rect.top <= window.innerHeight / 3 && rect.bottom >= window.innerHeight / 3) {
            activeIndex = index;
        }
    });

    const allNavLinks = document.querySelectorAll('.hud-link, .mobile-nav-link');
    allNavLinks.forEach(link => {
        if (parseInt(link.getAttribute('data-index')) === activeIndex) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (!isMobile) {
        const dockHeight = document.querySelector('.hud').getBoundingClientRect().height;
        // Calculate progress based on the active index instead of pure scroll to ensure snapping
        const maxIndex = document.querySelectorAll('.hud-link').length - 1;
        let indicatorProgress = activeIndex / maxIndex;
        hudIndicator.style.transform = `translateY(${indicatorProgress * (dockHeight - 24)}px)`;
    }
}

// ============================================================================
// Hero Canvas Particle Trail (Liquid Chrome/Neon)
// ============================================================================
const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let particles = [];
const maxParticles = 100;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 40 + 20;
        this.color = color;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98; // friction
        this.vy *= 0.98;
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.globalCompositeOperation = 'screen';
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function spawnParticles() {
    if (Math.abs(mouse.vx) > 0.1 || Math.abs(mouse.vy) > 0.1) {
        // Alternate cyan and magenta
        const isCyan = Math.random() > 0.5;
        const color = isCyan ? 'rgba(0, 243, 255, 0.5)' : 'rgba(255, 0, 60, 0.5)';
        particles.push(new Particle(mouse.x, mouse.y, color));
        if (particles.length > maxParticles) {
            particles.shift();
        }
    }
}

function renderFluidCanvas() {
    // Fade out for trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);

    spawnParticles();

    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

// ============================================================================
// About Parallax Depth Chambers
// ============================================================================
const parallaxChambers = document.querySelectorAll('.chamber');
const aboutSection = document.getElementById('about');

function updateParallax() {
    const rect = aboutSection.getBoundingClientRect();
    // Only animate if in viewport
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const distX = (mouse.x - cx) * 0.1;
        const distY = (mouse.y - cy) * 0.1;

        parallaxChambers.forEach(chamber => {
            const speed = parseFloat(chamber.getAttribute('data-speed'));
            const z = chamber.classList.contains('layer-3') ? -200 : chamber.classList.contains('layer-2') ? -100 : 0;
            chamber.style.transform = `translate3d(${distX * speed}px, ${distY * speed}px, ${z}px)`;
        });
    }
}

// ============================================================================
// Skills Gravity Constellation (2D DOM Physics)
// ============================================================================
const skillsList = [
    'C++', 'Java', 'JavaScript', 
    'React.js', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS',
    'Node.js', 'Express.js', 
    'SQL', 'PostgreSQL', 
    'Git', 'GitHub', 'VS Code'
];
const physicsBounds = document.getElementById('physics-bounds');
let orbs = [];

class SkillOrb {
    constructor(text) {
        this.el = document.createElement('div');
        this.el.className = 'skill-orb';
        this.el.textContent = text;
        physicsBounds.appendChild(this.el);

        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = 50; // Approximated for collision
        this.mass = 1;
        this.isHovered = false;

        this.el.addEventListener('mouseenter', () => this.isHovered = true);
        this.el.addEventListener('mouseleave', () => this.isHovered = false);
    }
    update() {
        if (this.isHovered) {
            this.vx *= 0.9;
            this.vy *= 0.9;
            return;
        }

        // Mouse Repulsion (Swipe scatter)
        const dxMouse = mouse.x - this.x;
        const dyMouse = mouse.y - (this.y - scroll.current); // Adjust mouse to absolute doc Y if needed, but bounded box is sticky/relative
        // Wait, bounds are relative to section
        const boundsRect = physicsBounds.getBoundingClientRect();
        const localMouseY = mouse.y - boundsRect.top;
        const localMouseX = mouse.x - boundsRect.left;

        const dmX = localMouseX - this.x;
        const dmY = localMouseY - this.y;
        const distToMouse = Math.sqrt(dmX * dmX + dmY * dmY);

        if (distToMouse < 150) {
            // Repel proportional to mouse velocity
            this.vx -= (dmX / distToMouse) * (Math.abs(mouse.vx) * 0.1 + 0.5);
            this.vy -= (dmY / distToMouse) * (Math.abs(mouse.vy) * 0.1 + 0.5);
        }

        // Gravity to center
        const centerX = boundsRect.width / 2;
        const centerY = boundsRect.height / 2;
        const dxCenter = centerX - this.x;
        const dyCenter = centerY - this.y;
        this.vx += dxCenter * 0.0002;
        this.vy += dyCenter * 0.0002;

        // Orb Repulsion
        orbs.forEach(other => {
            if (other === this) return;
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = 120; // Approximate width to avoid overlap
            if (dist < minDist && dist > 0) {
                const force = (minDist - dist) / minDist;
                this.vx += (dx / dist) * force * 0.5;
                this.vy += (dy / dist) * force * 0.5;
            }
        });

        // Friction
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.x += this.vx;
        this.y += this.vy;

        // Bounce walls
        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > boundsRect.width - 100) { this.x = boundsRect.width - 100; this.vx *= -1; }
        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        if (this.y > boundsRect.height - 50) { this.y = boundsRect.height - 50; this.vy *= -1; }

        this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }
}

// Init orbs
skillsList.forEach(skill => orbs.push(new SkillOrb(skill)));

// ============================================================================
// Projects Scroll Jacking
// ============================================================================
const projectsSection = document.getElementById('projects');
const horizontalScroll = document.getElementById('horizontal-scroll');
const projectsSticky = document.querySelector('.projects-sticky');

function updateHorizontalScroll() {
    if (isMobile) {
        horizontalScroll.style.transform = 'none';
        projectsSticky.style.transform = 'none';
        return;
    }
    
    const rect = projectsSection.getBoundingClientRect();
    // Scroll progress of the section
    if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        const progress = Math.abs(rect.top) / (rect.height - window.innerHeight);
        const maxScroll = horizontalScroll.scrollWidth - window.innerWidth + 200; // Add padding
        horizontalScroll.style.transform = `translate3d(${-progress * maxScroll}px, 0, 0)`;
        projectsSticky.style.transform = `translate3d(0, ${Math.abs(rect.top)}px, 0)`;
    } else if (rect.top > 0) {
        horizontalScroll.style.transform = `translate3d(0, 0, 0)`;
        projectsSticky.style.transform = `translate3d(0, 0, 0)`;
    } else {
        const maxScroll = horizontalScroll.scrollWidth - window.innerWidth + 200;
        horizontalScroll.style.transform = `translate3d(${-maxScroll}px, 0, 0)`;
        projectsSticky.style.transform = `translate3d(0, ${rect.height - window.innerHeight}px, 0)`;
    }
}

// Hole Punch Transition
const viewBtns = document.querySelectorAll('.view-project');
const holeOverlay = document.querySelector('.hole-punch-overlay');
const projectOverlay = document.getElementById('project-overlay');
const closeBtn = document.querySelector('.close-project');
const projTitle = document.getElementById('proj-title');

viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const title = btn.getAttribute('data-title');
        
        holeOverlay.style.transition = 'none';
        holeOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
        
        // Trigger reflow
        void holeOverlay.offsetWidth;
        
        // Expand
        holeOverlay.style.transition = 'clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1)';
        holeOverlay.classList.add('hole-punch-active');
        holeOverlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;

        setTimeout(() => {
            projTitle.textContent = title;
            projectOverlay.classList.add('visible');
        }, 800);
    });
});

closeBtn.addEventListener('click', () => {
    projectOverlay.classList.remove('visible');
    holeOverlay.classList.remove('hole-punch-active');
    holeOverlay.style.clipPath = `circle(0% at 50% 50%)`;
});

// ============================================================================
// Photo Lightbox Overlay
// ============================================================================
const profilePhoto = document.querySelector('.profile-photo');
const photoLightbox = document.getElementById('photo-lightbox');
const closeLightboxBtn = document.querySelector('.close-lightbox');

if (profilePhoto && photoLightbox && closeLightboxBtn) {
    profilePhoto.style.cursor = 'pointer';
    
    profilePhoto.addEventListener('click', () => {
        photoLightbox.classList.add('visible');
    });

    closeLightboxBtn.addEventListener('click', () => {
        photoLightbox.classList.remove('visible');
    });

    // Close when clicking empty void background
    photoLightbox.addEventListener('click', (e) => {
        if (e.target === photoLightbox) {
            photoLightbox.classList.remove('visible');
        }
    });
}

// ============================================================================
// Terminal Contact Form Sequence
// ============================================================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('sender-name').value;
        const email = document.getElementById('sender-email').value;
        const message = document.getElementById('sender-message').value;
        
        const terminalBody = document.getElementById('terminal-body');
        const terminalOutput = document.getElementById('terminal-output');
        
        terminalBody.style.display = 'none';
        terminalOutput.style.display = 'block';
        
        const sequence = [
            `> INITIALIZING SECURE CONNECTION...`,
            `> ENCRYPTING PAYLOAD [${name}]...`,
            `> BYPASSING MAINFRAME FIREWALLS...`,
            `> TRANSMISSION SIGNAL LOCKED.`,
            `> EXECUTING MAIL PROTOCOL...`
        ];
        
        let i = 0;
        terminalOutput.innerHTML = '';
        
        const interval = setInterval(() => {
            if (i < sequence.length) {
                terminalOutput.innerHTML += sequence[i] + '<br/>';
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    terminalOutput.innerHTML += `<br/><span style="color: var(--c-magenta);">[CONNECTION ESTABLISHED]</span><br/>> LAUNCHING LOCAL CLIENT...`;
                    
                    // Trigger mailto client
                    const mailtoLink = `mailto:chethansgowda809@gmail.com?subject=${encodeURIComponent("Contact request from " + name)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message)}`;
                    window.location.href = mailtoLink;
                    
                    // Reset form after a few seconds
                    setTimeout(() => {
                        terminalBody.style.display = 'block';
                        terminalOutput.style.display = 'none';
                        contactForm.reset();
                    }, 4000);
                    
                }, 500);
            }
        }, 600);
    });
}

// ============================================================================
// Experience Timeline + Footer Distort
// ============================================================================
const expSection = document.getElementById('experience');
const timelineProgress = document.querySelector('.timeline-progress');
const footerText = document.querySelector('.distort-text');

function updateTimeline() {
    const rect = expSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        let progress = (window.innerHeight - rect.top) / rect.height;
        progress = Math.max(0, Math.min(1, progress));
        timelineProgress.style.height = `${progress * 100}%`;
    }
}

function updateFooterDistort() {
    const cx = window.innerWidth / 2;
    const skewX = (mouse.x - cx) * -0.05;
    footerText.style.transform = `skewX(${skewX}deg)`;
}

// ============================================================================
// Main Render Loop
// ============================================================================
function render() {
    // Smooth Scroll Math
    scroll.current = lerp(scroll.current, scroll.target, 0.08);
    scroll.velocity = scroll.target - scroll.current;
    
    // Limits
    if(scroll.current < 0.1) scroll.current = 0;

    // Apply native smooth scroll via transform wrapper
    smoothContent.style.transform = `translate3d(0, -${scroll.current}px, 0)`;
    
    // Distort physics based on scroll velocity
    const skew = scroll.velocity * 0.05; // Skew angle
    const scale = 1 - Math.min(Math.abs(scroll.velocity) * 0.001, 0.1);
    
    // Apply CSS Variables for Distortion
    body.style.setProperty('--scroll-skew', `${skew}deg`);
    body.style.setProperty('--scroll-scale', scale);

    // Cursor Math
    cursor.x = lerp(cursor.x, mouse.x, 0.2);
    cursor.y = lerp(cursor.y, mouse.y, 0.2);
    cursorDot.style.left = `${cursor.x}px`;
    cursorDot.style.top = `${cursor.y}px`;

    // Ring Cursor Math (Slower)
    if (!cursorRing.classList.contains('hover-magnetic')) {
        ringCursor.x = lerp(ringCursor.x, mouse.x, 0.1);
        ringCursor.y = lerp(ringCursor.y, mouse.y, 0.1);
        cursorRing.style.left = `${ringCursor.x}px`;
        cursorRing.style.top = `${ringCursor.y}px`;
    } else {
        // If magnetic, snap to element center quickly?
        // Basic implementation leaves CSS to handle the scale/width change
        ringCursor.x = lerp(ringCursor.x, mouse.x, 0.3);
        ringCursor.y = lerp(ringCursor.y, mouse.y, 0.3);
        cursorRing.style.left = `${ringCursor.x}px`;
        cursorRing.style.top = `${ringCursor.y}px`;
    }

    renderFluidCanvas();
    updateParallax();
    
    // Update Orbs if in view
    const boundsRect = physicsBounds.getBoundingClientRect();
    if (boundsRect.top < window.innerHeight && boundsRect.bottom > 0) {
        orbs.forEach(orb => orb.update());
    }

    updateHorizontalScroll();
    updateTimeline();
    updateHUD();
    updateFooterDistort();

    requestAnimationFrame(render);
}

// Boot
window.scrollTo(0, 0);
document.body.classList.remove('loading');
render();
