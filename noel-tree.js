
// image urls
const closedGiftURL = "./img/gift_closed.png";
const openGiftURL = "./img/gift_opened.png";

// utils
const qs = (s) => document.querySelector(s);
const rand = (min, max) => Math.random() * (max - min) + min;

const treeMask = qs(".treePathMask");
const bottomMask = qs(".treeBottomMask");
const trunkMask = qs(".treeTrunkMask");
const starGroup = qs(".treeStar");
const particleContainer = qs("#pContainer");
const snowContainer = qs("#snowContainer");
const sparkle = qs(".sparkle");
const textElement = qs(".text");

// Gift & Popup Elements
const giftContainer = qs("#gift-container");
const giftImg = qs("#gift-img");
const popupOverlay = qs("#popup-overlay");
let isGiftOpened = false;


giftContainer.classList.add("closed");

giftContainer.addEventListener("click", () => {
    if (!isGiftOpened) {
        giftImg.src = openGiftURL;
        isGiftOpened = true;

        giftContainer.classList.remove("closed");

        // reset animation
        giftContainer.style.animation = "none";
        void giftContainer.offsetWidth; // force reflow
        giftContainer.style.animation = "";

        giftContainer.classList.add("opened");

        setTimeout(() => {
            popupOverlay.classList.add("active");
        }, 300);
    } else {
        popupOverlay.classList.add("active");
    }
});

function closePopup() {
    popupOverlay.classList.remove("active");
}

// Particle
const particleTypes = ["#star", "#circ", "#cross", "#heart"];
const particleColors = [
    "#FFFFFF",
    "#FF4500",
    "#00FF00",
    "#FFD700",
    "#ADD8E6",
    "#DC143C",
    "#228B22",
];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = rand(0, Math.PI * 2);
        const speed = rand(2, 6);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.2;
        this.life = 1.0;
        this.decay = rand(0.01, 0.03);
        this.element = this.createElement();
        this.scale = rand(0.5, 2.5);
        this.rotation = rand(0, 360);
        this.rotationSpeed = rand(-5, 5);
    }
    createElement() {
        const type =
            particleTypes[Math.floor(Math.random() * particleTypes.length)];
        const color =
            particleColors[Math.floor(Math.random() * particleColors.length)];
        const useEl = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "use"
        );
        useEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", type);
        useEl.setAttribute("fill", color);
        useEl.classList.add("particle");
        particleContainer.appendChild(useEl);
        return useEl;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
        const opacity = this.life * (0.5 + Math.random() * 0.5);
        if (this.life > 0) {
            this.element.style.opacity = opacity;
            this.element.setAttribute(
                "transform",
                `translate(${this.x}, ${this.y}) scale(${this.scale}) rotate(${this.rotation})`
            );
            return true;
        } else {
            this.element.remove();
            return false;
        }
    }
}

class Snowflake {
    constructor() {
        this.x = rand(0, 800);
        this.y = rand(-600, 0);
        this.vy = rand(0.5, 2.5);
        this.vx = rand(-0.5, 0.5);
        this.isSpecial = Math.random() < 0.15;
        this.scale = this.isSpecial ? rand(0.8, 1.2) : rand(0.5, 1.5);
        this.opacity = rand(0.3, 0.8);
        this.element = this.createElement();
        this.wobble = rand(0, Math.PI * 2);
        this.wobbleSpeed = rand(0.02, 0.05);
        this.rotation = 0;
    }
    createElement() {
        const useEl = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "use"
        );
        const href = this.isSpecial ? "#specialSnowFlake" : "#snowFlakeDef";
        useEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);
        useEl.classList.add("snowflake");
        snowContainer.appendChild(useEl);
        return useEl;
    }
    update() {
        this.y += this.vy;
        this.x += Math.sin(this.wobble) * 0.5;
        this.wobble += this.wobbleSpeed;
        if (this.isSpecial) this.rotation += 1;
        if (this.y > 600) {
            this.y = -50;
            this.x = rand(0, 800);
        }
        this.element.setAttribute(
            "transform",
            `translate(${this.x}, ${this.y}) scale(${this.scale}) rotate(${this.rotation})`
        );
        this.element.style.opacity = this.opacity;
    }
}

let particles = [];
let snowflakes = [];

function setupDraw(element) {
    const len = element.getTotalLength();
    element.style.strokeDasharray = len;
    element.style.strokeDashoffset = len;
    return len;
}

const treeLen = setupDraw(treeMask);
const bottomLen = setupDraw(bottomMask);
const trunkLen = setupDraw(trunkMask);

let startTime = null;
// Thời gian vẽ gốc cây, tán lá dưới cùng, và thân cây
const DURATION_TREE = 5000;
const DURATION_BOTTOM = 1000;
const DURATION_TRUNK = 1500;

const SHOW_GIFT_TIME =
    DURATION_TREE + DURATION_BOTTOM + DURATION_TRUNK + 500;

function initSnow() {
    for (let i = 0; i < 150; i++) snowflakes.push(new Snowflake());
}
initSnow();

function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    // Vẽ thân cây
    if (elapsed < DURATION_TREE) {
        const progress = elapsed / DURATION_TREE;
        treeMask.style.strokeDashoffset = treeLen * (1 - progress);
        const point = treeMask.getPointAtLength(progress * treeLen);
        sparkle.setAttribute(
            "transform",
            `translate(${point.x}, ${point.y})`
        );
        sparkle.style.opacity = 1;
        if (Math.random() > 0.5)
            particles.push(new Particle(point.x, point.y));
    } else {
        treeMask.style.strokeDashoffset = 0;
        sparkle.style.opacity = 0;
    }

    // Vẽ tán lá dưới cùng
    if (
        elapsed > DURATION_TREE - 500 &&
        elapsed < DURATION_TREE + DURATION_BOTTOM
    ) {
        const progress = Math.min(
            (elapsed - (DURATION_TREE - 500)) / DURATION_BOTTOM,
            1
        );
        bottomMask.style.strokeDashoffset = bottomLen * (1 - progress);
    }

    // Vẽ gốc cây 
    if (
        elapsed > DURATION_TREE + 200 &&
        elapsed < DURATION_TREE + 200 + DURATION_TRUNK
    ) {
        const progress = Math.min(
            (elapsed - (DURATION_TREE + 200)) / DURATION_TRUNK,
            1
        );
        trunkMask.style.strokeDashoffset = trunkLen * (1 - progress);
    } else if (elapsed > DURATION_TREE + 200 + DURATION_TRUNK) {
        trunkMask.style.strokeDashoffset = 0;
    }

    // Hiện ngôi sao
    if (elapsed > DURATION_TREE + 1000) {
        let relativeTime = (elapsed - (DURATION_TREE + 1000)) / 1000;
        if (relativeTime < 1) {
            const p = 0.3;
            const scaleVal =
                Math.pow(2, -10 * relativeTime) *
                Math.sin(((relativeTime - p / 4) * (2 * Math.PI)) / p) +
                1;
            starGroup.style.transform = `scale(${scaleVal})`;
        } else {
            starGroup.style.transform = `scale(1)`;
        }
    }

    // Hiện chữ Merry Christmas
    if (elapsed > DURATION_TREE + 1500) textElement.classList.add("show");

    // Hiện hộp quà
    if (elapsed > SHOW_GIFT_TIME) {
        giftContainer.classList.add("show");
    }

    // hiệu ứng tuyết và hạt
    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) particles.splice(i, 1);
    }
    for (let i = 0; i < snowflakes.length; i++) snowflakes[i].update();
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
