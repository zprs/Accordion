var noteGridCanvas;
var arrCavnas;

var ctxNoteGrid;
var ctxArr;

var PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();

createHiDPICanvas = function(id, w, h, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    var can = document.getElementById(id);
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

// For running at a lower fps
let lastFrameTime = 0;
let fps = 40;
let fpsInterval = 1000 / fps;

function start()
{
    noteGridCanvas = createHiDPICanvas("noteCanvas", window.innerWidth, (noteHeight + notePadding) * noteRowCount + notePadding, 2);
    arrCavnas = createHiDPICanvas("arrangementCanvas", window.innerWidth, window.innerHeight, 2);
    
    ctxNoteGrid = noteGridCanvas.getContext("2d");
    ctxArr = arrCavnas.getContext("2d");

    SetBPM(240);

    AddNewSection();

    lastFrameTime = Date.now();

    window.requestAnimationFrame(updateCanvas);
}

function updateCanvas()
{
    now = Date.now();
    let elapsed = now - lastFrameTime;

    let noteGridScroll = $("#noteCanvasContainer").scrollTop();
    let arrScroll = $("#sectionArrangementContainer").scrollTop();
    
    let noteGridX = $("#noteCanvasContainer").position().left;
    let noteGridY = $("#noteCanvasContainer").position().top;
    let noteGridWidth = $("#noteCanvasContainer").width();
    let noteGridHeight = $("#noteCanvasContainer").height();

    let arrangementBoxX = $("#sectionArrangementContainer").position().left;
    let arrangementBoxY = $("#sectionArrangementContainer").position().top;
    let arrBoxWidth = $("#sectionArrangementContainer").width();
    let arrBoxHeight = $("#sectionArrangementContainer").height();

    updateNoteGridSelection(noteGridX, noteGridY - noteGridScroll, noteGridWidth, noteGridHeight + noteGridScroll);
    updateArrangementBoxes(arrangementBoxX, arrangementBoxY - arrScroll, arrBoxWidth, arrBoxHeight + arrScroll);
    
    
    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval)
    {
        ctxArr.clearRect(0, 0, arrBoxWidth, arrBoxHeight);

        lastFrameTime = now;
        updateDrawNoteGrid(ctxNoteGrid);
        drawArrangementGrid(ctxArr, 0, 0);
        drawArrangementPlayBar(ctxArr, noteWidth + notePadding, 0);
    }
    
    if(mouse.clickedDown)
        mouse.clickedDown = false;

    if(mouse.clickedUp)
        mouse.clickedUp = false;

    window.requestAnimationFrame(updateCanvas);
}

start();