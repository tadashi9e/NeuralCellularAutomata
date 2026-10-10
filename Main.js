// Canvas & context
let canvas = document.getElementById("canvas");
const gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pause = false;
let slowdown = 0;
let draw_mode = 4;

let panX = 0;
let panY = 0;
let scale = 1.0;

document.addEventListener(
    "keydown", function(event) {
        if (event.key == 'Home' ||
            event.key == 'h') {
            slowdown = 0;
            panX = 0;
            panY = 0;
            scale = 1.0;
            // console.log(`translate(${panX}px, ${panY}px) scale(${scale})`);
            canvas.style.transform =
                `translate(${panX}px, ${panY}px) scale(${scale})`;
            return;
        }
        if (event.key == 'ArrowLeft' ||
            event.key == '<') {
            pause = true;
            return;
        }
        if (event.key == 'ArrowRight' ||
            event.key == '>') {
            pause = false;
            return;
        }
        if (event.key == 'ArrowDown' ||
            event.key == 'd') {
            slowdown++;
            return;
        }
        if (event.key == 'ArrowUp' ||
            event.key == 'u') {
            slowdown--;
            if (slowdown < 0) {
                slowdown = 0;
            }
            return;
        }
        if (event.key == 'PageDown' ||
            event.key == '1') {
            draw_mode = 1;
            layer.draw1();
            return;
        }
        if (event.key == 'PageUp' ||
            event.key == '4') {
            draw_mode = 4;
            layer.draw4();
            return;
        }
    });

let prev_clientX = null;
let prev_clientY = null;
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
        // console.log(`translate(${panX}px, ${panY}px) scale(${scale})`);
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
        // console.log(`translate(${panX}px, ${panY}px) scale(${scale})`);
        canvas.style.transform =
            `translate(${panX}px, ${panY}px) scale(${scale})`;
    });

let layer;

function start() {
    layer = new MainLayer();
    loadPreset(0);
    loop();
}

let drawcycle = 0;
let cycle = 0;

function loop(){
    if (!pause) {
        if (drawcycle <= slowdown) {
            drawcycle++;
        } else {
            drawcycle = 0;
            layer.update(cycle);
            switch (draw_mode) {
            case 1:
                layer.draw1();
                break;
            case 4:
                if (cycle == 3) {
                    layer.draw4();
                }
                break;
            }
            cycle++;
            if (cycle >= 4) {
                cycle = 0;
            }
        }
    }
    requestAnimationFrame(() => loop());
}

start();
