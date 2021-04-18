var noteGridFuture = {};

var notePadding = 2;
var noteWidth = 30;
var noteHeight = 20;

var noteHighlightedColors = ["#ff4040", "#ff8c40", "#ffdc40", "#a9ff40", "#47ffa6", "#47fff9","#78a9ff", "#4772ff", "#9747ff","#d063ff", "#f647ff", "#ff478e"]; 

var noteLength = 1;
var maxNoteLength = 5;

var selectedNote = {x: -1, y: -1};
var selectedOctaveNote = -1;

var octaveStartX = notePadding;
var gridStartX = notePadding * 2 + noteWidth;
var gridStartY = notePadding;

function updateDrawNoteGrid(ctx)
{
    if(selectedNote.x != -1 && selectedNote.y != -1)
    {
        //Copy the note grid to a temp note grid where we can make the changes that are going to happen in the next moment if the user were to click
        noteGridFuture = {};

        for(var x = 0; x < noteColumnCount; x++)
        {
            noteGridFuture[x] = {};
    
            for(var y = 0; y < noteRowCount; y++)
            {
                noteGridFuture[x][y] = {};
                noteGridFuture[x][y].enabled = currentPart.noteGrid[x][y].enabled;
                noteGridFuture[x][y].noteLength = currentPart.noteGrid[x][y].noteLength;
            }
        }

        toggleNote(noteGridFuture, selectedNote.x, selectedNote.y);
        drawNoteGrid(ctx, noteGridFuture, gridStartX, gridStartY);
    }
    else
        drawNoteGrid(ctx, currentPart.noteGrid, gridStartX, gridStartY);
        
    drawOctaveNotes(ctx, octaveStartX, gridStartY, currentScale);

    if(currentPart != null && currentPart.part.state == "started" && !currentPart.part.mute)
        drawPlayBar(ctx, gridStartX, gridStartY, currentPart.part);
}

function updateNoteGridSelection(posValues)
{
    let selectedNoteIndex = gridSelection(octaveStartX + posValues.startX, gridStartY + posValues.startY, noteWidth, noteHeight, notePadding, noteColumnCount, noteRowCount, posValues.width, posValues.height);
    noteSelection(selectedNoteIndex.x, selectedNoteIndex.y);
    
    //Note in grid is clicked - Toggle that note
    if(mouse.clickedDown && selectedNote.x != -1 && selectedNote.y != -1)
    {
        var changedNotes = toggleNote(currentPart.noteGrid, selectedNote.x, selectedNote.y);

        for (let i = 0; i < changedNotes.length; i++) {
            const changedNoteCoors = changedNotes[i];

            var cNX = changedNoteCoors.x;
            var cNY = changedNoteCoors.y;

            var changedNote = currentPart.noteGrid[cNX][cNY];

            var enabled = changedNote.enabled;
            var length = changedNote.noteLength;

            UpdateNote(cNX, cNY, enabled, length);
        }
    }
}

function drawOctaveNotes(ctx, startX, startY, _scale)
{
    ctx.textAlign = "center";
    ctx.font = "15px Open Sans";
    ctx.textBaseline = "middle";

    for(var i = 0; i < noteRowCount; i++)
    {
        var scaleNote = cooridantesToNoteValue(i);

        var addStartY = (notePadding * i) + (noteHeight * i) + startY;
        var noteFillStyle = "white";

        var scaleClickedColor = LightenDarkenColor(noteHighlightedColors[i % 12], 20);
        var scaleHoverColor = LightenDarkenColor(noteHighlightedColors[i % 12], 80);

        if(selectedOctaveNote == i)
            noteFillStyle = mouse.clicked ?  scaleClickedColor : scaleHoverColor;

        ctx.fillStyle = noteFillStyle;
        ctx.beginPath();
        ctx.rect(startX, addStartY, noteWidth, noteHeight);
        ctx.fill();

        ctx.fillStyle = currentPart.color;
        ctx.fillText(scaleNote, startX + noteWidth / 2, addStartY + noteHeight / 2 + notePadding, noteWidth);
    }
}

function drawPlayBar(ctx, startX, startY, part)
{
    // var offset = -20;
    var barWidth = 2;

    var fullWidth = (notePadding + noteWidth) * (noteColumnCount - 1);
    var xPosition = part.progress * fullWidth;


    ctx.beginPath();
    ctx.fillStyle = currentPart.color;
    ctx.rect(startX + xPosition, startY, -barWidth, (notePadding + noteHeight) * noteRowCount);
    ctx.fill();
}

function drawNoteGrid(ctx, grid, gridStartX, gridStartY)
{ 
    ctx.beginPath();
    ctx.fillStyle = "#ebebeb";
    ctx.rect(0, 0, notePadding + (notePadding + noteWidth) * noteColumnCount, notePadding + (notePadding + noteHeight) * noteRowCount);
    ctx.fill();

    for(var x = noteColumnCount - 1; x >= 0; x--)
    {
        for(var y = 0; y < noteRowCount; y++)
        {
            var startX = (notePadding * x) + (noteWidth * x) + gridStartX;
            var startY = (notePadding * y) + (noteHeight * y) + gridStartY;

            var note = grid[x][y];
            var noteExists = note && note.enabled;
            var thisNoteLength = noteExists ? note.noteLength : 1;

            //note in the note grid -> need this reference to find the notlength if it is deleted in the "future note grid"
            var currentNoteExists = currentPart.noteGrid[x][y] && currentPart.noteGrid[x][y].enabled;
            var currentNoteLength = currentNoteExists ? currentPart.noteGrid[x][y].noteLength : 1;

            var noteIsHilighted = x == selectedNote.x && y == selectedNote.y;
            var longNoteWidth = noteWidth;

            var noteColor = "white";
            var outlineColor = null;

            if(noteIsHilighted)
            {
                noteColor = LightenDarkenColor(noteHighlightedColors[y % 12], 20);
                outlineColor = LightenDarkenColor(noteColor, 20);

                if(currentNoteExists)
                    longNoteWidth = noteWidth + (currentNoteLength - 1) * (noteWidth + notePadding);
                else
                    longNoteWidth = noteWidth + (noteLength - 1) * (noteWidth + notePadding);
            }
            else if(noteExists)
            {
                noteColor = noteHighlightedColors[y % 12];
                outlineColor = LightenDarkenColor(noteColor, -30);
                longNoteWidth = noteWidth + (thisNoteLength - 1) * (noteWidth + notePadding);
            }
        
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.rect(startX, startY, noteWidth, noteHeight);
            ctx.fill();
            
            ctx.fillStyle = noteColor;
            ctx.beginPath();
            ctx.rect(startX, startY, longNoteWidth, noteHeight);

            if(noteIsHilighted)
            {
                if(noteExists)
                    ctx.globalAlpha = 0.3;
                else
                    ctx.globalAlpha = 0.6;
            }

            ctx.fill();

            if(outlineColor != null)
            {
                ctx.strokeStyle = outlineColor;
                ctx.lineWidth = 2;
    
                var lineOverlap = 0.5;
    
                ctx.beginPath();
                ctx.rect(startX + ctx.lineWidth * lineOverlap, startY + ctx.lineWidth * lineOverlap, longNoteWidth - 2 * ctx.lineWidth * lineOverlap, noteHeight - 2 * ctx.lineWidth * lineOverlap);
                ctx.stroke();
            }

            ctx.globalAlpha = 1;
        }
    }   
}

function gridSelection(startX, startY, boxWidth, boxHeight, boxPadding, maxXIndex, maxYIndex, width, height)
{
    var x = (mouse.x - startX) / (boxWidth + boxPadding);
    var y = (mouse.y - startY) / (boxHeight + boxPadding);
    var inBoundsPage = mouse.x > startX && mouse.y > startY && mouse.x < width + startX && mouse.y < height + startY;
    var inBoundsIndex = x < maxXIndex && y < maxYIndex;

    if(inBoundsPage && inBoundsIndex)
    {
        var xIndex = Math.floor(x);
        var yIndex = Math.floor(y);

        return {x: xIndex, y: yIndex};
    }
    else
        return {x: -1, y: -1};
        
}

//Set "selectedNote" to the selectedNote and "selectedOctave" to selectedOctave
function noteSelection(xIndex, yIndex)
{
    if(xIndex != -1 && yIndex != -1)
    {
        //the selected note is a scale not on the far left
        if(xIndex == 0)
        {
            selectedOctaveNote = yIndex;
            selectedNote.x = -1; 
            selectedNote.y = -1;
        }
        else
        {
            //subtract one from x index to account for the one row of scale notes
            selectedOctaveNote = -1;
            selectedNote.x = xIndex - 1; 
            selectedNote.y = yIndex;
        }
    }
    else
    {
        selectedOctaveNote = -1;
        selectedNote.x = -1;
        selectedNote.y = -1;
    }
}

function toggleNote(grid, x, y)
{
    var note = grid[x][y];
    var changedNotes = [];
    
    if(!note)
        return;

    var newEnabled = !note.enabled;
    var toggleNoteLength = x + noteLength > noteColumnCount - 1 ? noteColumnCount - 1 - x : noteLength;

    note.enabled = newEnabled;
    note.noteLength = toggleNoteLength;

    var noteDeleteLength = newEnabled ? toggleNoteLength : 1;

    //Shorten notes that overlap before
    for (let i = 0; i < x; i++) {
        
        if(grid[i][y] && grid[i][y].enabled)
        {
            if(grid[i][y].noteLength + i >= x)
            {
                grid[i][y].noteLength = (x - i)
                changedNotes.push({x: i, y: y});
            }
        }
    }

    //Shorten notes that overlap after the head of this note
    for (let i = x + 1; i < x + noteDeleteLength; i++) {
        
        if(grid[i][y] && grid[i][y].enabled)
        {
            if(grid[i][y].noteLength > 1)
            {
                grid[i + 1][y].noteLength = grid[i][y].noteLength - 1;
                console.log(grid[i + 1][y].noteLength);
                grid[i + 1][y].enabled = true;

                changedNotes.push({x: i + 1, y: y});
            }

            grid[i][y].noteLength = 0;
            grid[i][y].enabled = false;

            changedNotes.push({x: i, y: y});
        }
    }

    changedNotes.push({x: x, y: y});
    return changedNotes;
}

function LightenDarkenColor(col,amt) {
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}