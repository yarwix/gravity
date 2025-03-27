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
        constructor(element, allElements) {
            this.element = element;
            this.allElements = allElements;
            this.isDragging = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.velocityX = 0;
            this.velocityY = 0;
            this.gravity = 0.5;
            this.friction = 0.98;
            this.bounceFactor = 0.4;
            this.restThreshold = 0.5;
    
            this.init();
        }
    
        init() {
            this.element.style.position = "absolute";
            this.element.style.left = `${Math.random() * (window.innerWidth - this.element.clientWidth)}px`;
            this.element.style.top = `${Math.random() * (window.innerHeight - this.element.clientHeight)}px`;
    
            this.element.addEventListener("mousedown", this.startDrag.bind(this));
            this.element.addEventListener("touchstart", this.startDrag.bind(this), { passive: false });
    
            window.addEventListener("mousemove", this.drag.bind(this));
            window.addEventListener("touchmove", this.drag.bind(this), { passive: false });
    
            window.addEventListener("mouseup", this.endDrag.bind(this));
            window.addEventListener("touchend", this.endDrag.bind(this));
        }
    
        startDrag(event) {
            this.isDragging = true;
    
            let clientX = event.clientX || event.touches[0].clientX;
            let clientY = event.clientY || event.touches[0].clientY;
    
            let rect = this.element.getBoundingClientRect();
            this.offsetX = clientX - rect.left;
            this.offsetY = clientY - rect.top;
    
            this.velocityX = 0;
            this.velocityY = 0;
        }
    
        drag(event) {
            if (!this.isDragging) return;
            event.preventDefault();
    
            let clientX = event.clientX || event.touches[0].clientX;
            let clientY = event.clientY || event.touches[0].clientY;
    
            let newX = clientX - this.offsetX;
            let newY = clientY - this.offsetY;
    
            newX = Math.max(0, Math.min(newX, window.innerWidth - this.element.clientWidth));
            newY = Math.max(0, Math.min(newY, window.innerHeight - this.element.clientHeight));
    
            [newX, newY] = this.resolveCollisions(newX, newY);
    
            this.element.style.left = `${newX}px`;
            this.element.style.top = `${newY}px`;
        }
    
        endDrag() {
            this.isDragging = false;
        }
    
        applyPhysics() {
            if (this.isDragging) return;
    
            let rect = this.element.getBoundingClientRect();
            let newX = rect.left + this.velocityX;
            let newY = rect.top + this.velocityY;
    
            this.velocityY += this.gravity;
            this.velocityX *= this.friction;
            this.velocityY *= this.friction;
    
            [newX, newY] = this.resolveCollisions(newX, newY);
    
            if (newY + rect.height >= window.innerHeight) {
                newY = window.innerHeight - rect.height;
                if (Math.abs(this.velocityY) < this.restThreshold) {
                    this.velocityY = 0;
                } else {
                    this.velocityY *= -this.bounceFactor;
                }
            }
            if (newX <= 0) {
                newX = 0;
                this.velocityX *= -this.bounceFactor;
            }
            if (newX + rect.width >= window.innerWidth) {
                newX = window.innerWidth - rect.width;
                this.velocityX *= -this.bounceFactor;
            }
    
            this.element.style.left = `${newX}px`;
            this.element.style.top = `${newY}px`;
        }
    
        resolveCollisions(newX, newY) {
            let adjustedX = newX;
            let adjustedY = newY;
    
            this.allElements.forEach(other => {
                if (other === this.element) return;
    
                let rect1 = { left: adjustedX, top: adjustedY, width: this.element.clientWidth, height: this.element.clientHeight };
                let rect2 = other.getBoundingClientRect();
    
                if (this.isColliding(rect1, rect2)) {
                    let dx = (rect1.left + rect1.width / 2) - (rect2.left + rect2.width / 2);
                    let dy = (rect1.top + rect1.height / 2) - (rect2.top + rect2.height / 2);
                    let overlapX = Math.abs(rect1.left - rect2.left) < rect1.width ? (rect1.width - Math.abs(rect1.left - rect2.left)) / 2 : 0;
                    let overlapY = Math.abs(rect1.top - rect2.top) < rect1.height ? (rect1.height - Math.abs(rect1.top - rect2.top)) / 2 : 0;
    
                    if (overlapX > 0 && overlapY > 0) {
                        if (overlapX > overlapY) {
                            adjustedY += dy > 0 ? overlapY : -overlapY;
                            this.velocityY *= -this.bounceFactor;
                        } else {
                            adjustedX += dx > 0 ? overlapX : -overlapX;
                            this.velocityX *= -this.bounceFactor;
                        }
                    }
                }
            });
    
            return [adjustedX, adjustedY];
        }
    
        isColliding(rect1, rect2) {
            return !(rect1.top + rect1.height <= rect2.top ||
                rect1.top >= rect2.top + rect2.height ||
                rect1.left + rect1.width <= rect2.left ||
                rect1.left >= rect2.left + rect2.width);
        }
    }
    
    // Apply gravity globally to all elements
    const elements = document.querySelectorAll(".gravity");
    const objects = [];
    
    elements.forEach(el => objects.push(new GravityDraggable(el, elements)));
    
    function physicsLoop() {
        objects.forEach(obj => obj.applyPhysics());
        requestAnimationFrame(physicsLoop);
    }
    
    // Start the physics loop
    physicsLoop();
}