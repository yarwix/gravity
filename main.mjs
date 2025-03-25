import appInfo from './app-info.js';

document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();

function init() {
    initGravity();
    logLoadMessage();
}

function logLoadMessage() {
    const
        isLocal = window.location.protocol === 'http' || 'https' ? false : true,
        appUrl = isLocal ? 'http://127.0.0.1:8080' : 'https://yarwix.github.io/gravity';
    fetch(`${appUrl}/log-animation.svg`)
        .then(response => response.text())
        .then(svgXml => {
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgXml)}`;
            console.log('%c ', `
            background-image: url(${svgDataUrl});
            padding-top: 40px;
            padding-left: 150px;
            background-size: contain;
            background-position: center center;
            background-repeat: no-repeat;
        `);
            console.log(`V. ${appInfo.version}`);
        });
}

function initGravity() {
    class GravityDraggable {
        constructor(element) {
            this.element = element;
            this.isDragging = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.velocityX = 0;
            this.velocityY = 0;
            this.gravity = 0.4;
            this.friction = 0.98;
            this.bounceFactor = 0.5;
            this.minVelocity = 0.1; // Minimum velocity before stopping
            this.restThreshold = 5; // Threshold for stopping bounce
            this.animationFrame = null;
    
            this.init();
        }
    
        init() {
            this.element.style.position = "absolute";
    
            // Random initial position within viewport
            this.element.style.left = `${Math.random() * (window.innerWidth - this.element.clientWidth)}px`;
            this.element.style.top = `${Math.random() * (window.innerHeight - this.element.clientHeight)}px`;
    
            this.element.addEventListener("mousedown", this.startDrag.bind(this));
            this.element.addEventListener("touchstart", this.startDrag.bind(this), { passive: false });
    
            window.addEventListener("mousemove", this.drag.bind(this));
            window.addEventListener("touchmove", this.drag.bind(this), { passive: false });
    
            window.addEventListener("mouseup", this.endDrag.bind(this));
            window.addEventListener("touchend", this.endDrag.bind(this));
    
            this.applyPhysics(); // Start physics simulation on load
        }
    
        startDrag(event) {
            this.isDragging = true;
            cancelAnimationFrame(this.animationFrame);
    
            let clientX = event.clientX || event.touches[0].clientX;
            let clientY = event.clientY || event.touches[0].clientY;
    
            let rect = this.element.getBoundingClientRect();
            this.offsetX = clientX - rect.left;
            this.offsetY = clientY - rect.top;
    
            this.velocityX = 0;
            this.velocityY = 0; // Reset velocity when grabbed
        }
    
        drag(event) {
            if (!this.isDragging) return;
            event.preventDefault();
    
            let clientX = event.clientX || event.touches[0].clientX;
            let clientY = event.clientY || event.touches[0].clientY;
    
            let newX = clientX - this.offsetX;
            let newY = clientY - this.offsetY;
    
            // Keep inside viewport
            newX = Math.max(0, Math.min(newX, window.innerWidth - this.element.clientWidth));
            newY = Math.max(0, Math.min(newY, window.innerHeight - this.element.clientHeight));
    
            this.velocityX = (newX - this.element.offsetLeft) * 0.6;
            this.velocityY = (newY - this.element.offsetTop) * 0.6;
    
            this.element.style.left = `${newX}px`;
            this.element.style.top = `${newY}px`;
        }
    
        endDrag() {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.applyPhysics();
        }
    
        applyPhysics() {
            if (this.isDragging) return;
    
            let rect = this.element.getBoundingClientRect();
            let newX = rect.left + this.velocityX;
            let newY = rect.top + this.velocityY;
    
            this.velocityY += this.gravity; // Gravity effect
            this.velocityX *= this.friction; // Air resistance
            this.velocityY *= this.friction;
    
            // Ensure elements keep falling until they land
            if (newY + rect.height < window.innerHeight && Math.abs(this.velocityY) < this.restThreshold) {
                this.velocityY += this.gravity * 0.5; // Small push to prevent mid-air sticking
            }
    
            // Ground collision detection
            if (newY + rect.height >= window.innerHeight) {
                newY = window.innerHeight - rect.height;
    
                // If velocity is small, stop completely (prevents jittering)
                if (Math.abs(this.velocityY) < this.restThreshold) {
                    this.velocityY = 0;
                    this.velocityX *= 0.8; // Apply some friction to stop sliding
                } else {
                    this.velocityY *= -this.bounceFactor; // Bounce effect
                }
            }
    
            // Ensure objects don’t stop in mid-air
            if (newY + rect.height < window.innerHeight && Math.abs(this.velocityY) < this.minVelocity) {
                this.velocityY += this.gravity * 1.5; // Apply extra downward force
            }
    
            // Left and right boundary collision
            if (newX < 0) {
                newX = 0;
                this.velocityX *= -this.bounceFactor;
            } else if (newX + rect.width > window.innerWidth) {
                newX = window.innerWidth - rect.width;
                this.velocityX *= -this.bounceFactor;
            }
    
            this.element.style.left = `${newX}px`;
            this.element.style.top = `${newY}px`;
    
            // Stop the animation if the movement is minimal
            if (Math.abs(this.velocityX) > this.minVelocity || Math.abs(this.velocityY) > this.minVelocity) {
                this.animationFrame = requestAnimationFrame(this.applyPhysics.bind(this));
            }
        }
    }
    
    // Apply physics to all elements with class "gravity"
    document.querySelectorAll(".gravity").forEach(el => new GravityDraggable(el));
}