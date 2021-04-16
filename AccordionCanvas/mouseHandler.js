var mouse = {
    x :undefined,
    y: undefined,
    clicked: false,
    clickedDown: false
}

window.addEventListener('mousemove', event => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mousedown', event => {
    mouse.clicked = true;
    mouse.clickedDown = true;
});

window.addEventListener('mouseup', event => {
    mouse.clicked = false;
    mouse.clickedDown = false;
});