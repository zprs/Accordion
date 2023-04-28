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

function setCanvasHeight(id, h, ratio)
{
    var can = document.getElementById(id);
    can.height = h * ratio;
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
}

// For running at a lower fps
let lastFrameTime = 0;
let fps = 40;
let fpsInterval = 1000 / fps;

let HDPI_RATIO = 2;


function startCanvas()
{
    noteGridCanvas = createHiDPICanvas("noteCanvas", window.innerWidth, 0, HDPI_RATIO);
    arrCavnas = createHiDPICanvas("arrangementCanvas", window.innerWidth, window.innerHeight, HDPI_RATIO);

    ctxNoteGrid = noteGridCanvas.getContext("2d");
    ctxArr = arrCavnas.getContext("2d");

    SetBPM(240);
    SetTimeSignature(4,4)
    AddNewSectionDefault();
    setLoopStartAndEnd(loopSelectionIndexes.start, loopSelectionIndexes.end);
    updateNoteGridHeight();
    lastFrameTime = Date.now();

    window.requestAnimationFrame(updateCanvas);
}

function updateCanvas()
{
    now = Date.now();
    let elapsed = now - lastFrameTime;

    let posNotes = positionValues("#noteCanvasContainer");
    let posArr = positionValues("#sectionArrangementContainer");

    updateUserInput();
    updateNoteGridSelection(posNotes);
    updateArrangementBoxes(posArr);
    
    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval)
    {
        ctxNoteGrid.clearRect(0, 0, posNotes.width, posNotes.height);
        ctxArr.clearRect(0, 0, posArr.width, posArr.height);

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

function updateNoteGridHeight()
{
    setCanvasHeight("noteCanvas", (noteHeight + notePadding) * noteRowCount + notePadding, HDPI_RATIO);
}

function positionValues(id)
{
    let x = $(id).position().left;
    let y = $(id).position().top;
    let width = $(id).width();
    let height = $(id).height();
    let scrollY = $(id).scrollTop();
    let scrollX = $(id).scrollLeft();

    return {
        startX: x - scrollX,
        startY: y - scrollY,
        width: width + scrollX,
        height: height + scrollY
    }
}

startCanvas();