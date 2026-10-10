// Canvas & context
let canvas = document.getElementById("canvas");
const gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let panX = 0;
let panY = 0;
let scale = 1.0;
var prev_clientX = null;
var prev_clientY = null;
window.addEventListener(
    "key", function(event) {
        // reset
        panX = 0;
        panY = 0;
        scale = 1.0;
    });
window.addEventListener(
    "wheel", function(event) {
        prev_clientX = null;
        prev_clientY = null;
        event.preventDefault();
        let newScale = scale - 0.001 * event.deltaY;
        if (newScale < 1.0) {
            newScale = 1.0;
        }
        let x = (event.offsetX - panX) / scale;
        let y = (event.offsetY - panY) / scale;
        panX = event.offsetX - x * newScale;
        panY = event.offsetY - y * newScale;
        scale = newScale;
        console.log(`translate(${panX}px, ${panY}px) scale(${scale})`);
        canvas.style.transform =
            `translate(${panX}px, ${panY}px) scale(${scale})`;
    });
window.addEventListener(
    "pointerdown", function(event) {
        prev_clientX = event.clientX;
        prev_clientY = event.clientY;
    });
window.addEventListener(
    "pointerup", function(event) {
        prev_clientX = null;
        prev_clientY = null;
    });
window.addEventListener(
    "pointercancel", function(event) {
        prev_clientX = null;
        prev_clientY = null;
    });
window.addEventListener(
    "pointermove", function(event) {
        if (prev_clientX == null || prev_clientY == null) {
            return;
        }
        panX += event.clientX - prev_clientX;
        panY += event.clientY - prev_clientY;
        prev_clientX = event.clientX;
        prev_clientY = event.clientY;
        console.log(`translate(${panX}px, ${panY}px) scale(${scale})`);
        canvas.style.transform =
            `translate(${panX}px, ${panY}px) scale(${scale})`;
    });

let layer;

function start() {
    layer = new MainLayer();
    loadPreset(0);
    loop();
}

var cycle = 0;

function loop(){
    layer.update(cycle);
    if (cycle == 3) {
        layer.draw();
    }
    cycle++;
    if (cycle >= 4) {
        cycle = 0;
    }
    requestAnimationFrame(() => loop());
}

start();
