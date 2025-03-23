import appInfo from './app-info.js';

document.readyState === "loading"
? document.addEventListener("DOMContentLoaded", init)
: init();

function init() {
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
            background-image: url(${ svgDataUrl });
            padding-top: 40px;
            padding-left: 150px;
            background-size: contain;
            background-position: center center;
            background-repeat: no-repeat;
        `);
        console.log(`V. ${appInfo.version}`);
    });  
}