document.readyState === "loading"
? document.addEventListener("DOMContentLoaded", doSomething)
: init();

function init() {
    logLoadMessage();
}

function logLoadMessage() {
    const appUrl = 'https://yarwix.github.io/gravity';
    fetch(`${appUrl}/log-animation.svg`)
    .then(response => response.text())
    .then(svgXml => {
        const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgXml)}`;
        console.log('%c ', `
            background-image: url(${ svgDataUrl });
            padding-top: 200px;
            padding-left: 750px; 
            background-size: contain;
            background-position: center center;
            background-repeat: no-repeat;
        `);
    });  
}