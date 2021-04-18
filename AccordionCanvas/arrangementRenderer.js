let selectionBlocks = []

let arrangementBoxWidth = 62;
let arrangementBoxHeight = 20;
let arrangementBoxPadding = 2;
let targetArrangementBoxIndexes = {x: -1, y: -1};

let arrBgColor = "#ebebeb"

//Edit Arr Box Buttons
let arrEditFont = "10px Open Sans";
let arrEditTextColor = "#ffffff";
let arrEditBoxHoverColorShift = -50;

let hoveredEditBoxIndex = -1;
let selectedEditBoxIndex = -1;

let createBoxHovered = false;

//Create Arr Box Button
let createArrBoxFont = "20px Open Sans";
let createArrBoxButtonColor = "#c4c4c4";
let createArrBoxButtonOutlineColor = "#919191";
let createArrBoxButtonHoverShift = -40;
let createArrBoxButtonClickedShift = -20;

//Loop Bar
let loopBarHeight = 5;
let loopStartIndex = 0;
let loopEndIndex = 1;
let loopSelectionIndexes = {start: 0, end: 1};

let loopBarBackgroundColor = "#dfdfdf";
let loopBarHandleColor = "#333333"
let loopBarBaseColor = "#333333"
let loopBarHovered = false;
let loopBarSelected = false;
let loopBarHoveredIndex = -1;
let loopBarHandleWidth = 5;
let loopBarHandleHeight = 10
let hoveredLoopBarHandleIndex = -1;

//Values calculated durring runtime
let arrBoxFullWidth = 0;
let arrBoxFullHeight = 0;
let loopBarFullWidth = 0;

function drawArrangementGrid(ctx, startX, startY)
{
    let arrBoxFullWidth = arrangementBoxPadding + (arrangementBoxPadding + arrangementBoxWidth) * numberOfPartsPerSong + noteWidth + arrangementBoxPadding;
    let arrBoxFullHeight = arrangementBoxPadding + (arrangementBoxPadding + arrangementBoxHeight) * sections.length;
    
    ctx.beginPath();
    ctx.fillStyle = arrBgColor;
    ctx.rect(startX, startY, arrBoxFullWidth, arrBoxFullHeight);
    ctx.fill();

    //Draw Arrangement Boxes & Edit Boxes
        
    for(let y = 0; y < sections.length; y++)
    {
        drawArrEditBox(ctx, startX, startY, sections[y], y);

        for(let x = 0; x < numberOfPartsPerSong; x++)
        {
            let isFilled = checkForSectionState(y, x).filled;
            let isHovered = x == targetArrangementBoxIndexes.x && y == targetArrangementBoxIndexes.y;

            if(isFilled)
                color = isHovered ? LightenDarkenColor(sections[y].color, 20) : sections[y].color;
            else
                color = isHovered ? sections[y].color : "#ffffff";

            if(isHovered)
                ctx.globalAlpha = 0.5;

            drawArrBox(ctx, startX + noteWidth + arrangementBoxPadding, startY, x, y, color, 0, isFilled);

            ctx.globalAlpha = 1;
        }
    }

    // FIX - THIS IS VERY REPETETIVE TO CALCULATE THESE VALUES EACH TIME YOU NEED THEM

    //Draw Create Arrangement Box
    let creatArrBoxY = startY + arrangementBoxPadding + sections.length * (noteHeight + arrangementBoxPadding);
    drawCreateArrangementBoxButton(ctx, startX + arrangementBoxPadding, creatArrBoxY);

    //Draw Loop Bar
    drawLoopBar(ctx, startX + noteWidth + notePadding + arrangementBoxPadding, startY + creatArrBoxY + 5);
}

function updateArrangementBoxes(posValues)
{
    editBoxSelection(posValues.startX, posValues.startY, posValues.width, posValues.height);
    arrangementBoxSelection(posValues.startX + noteWidth, posValues.startY, posValues.width, posValues.height);

    let creatArrBoxY = arrangementBoxPadding + sections.length * (noteHeight + arrangementBoxPadding);
    createArrBoxSelection(posValues.startX, posValues.startY + creatArrBoxY, posValues.width, posValues.height);
    loopBarSelection(posValues.startX + noteWidth + notePadding + arrangementBoxPadding, posValues.startY + creatArrBoxY);
}

// DRAW FUNCTIONS ------------------------------------------

function drawArrBox(ctx, startX, startY, xIndex, yIndex, color, ldColor, drawOutline)
{
    let boxPos = getArrBoxPositionFromCoords(startX, startY, xIndex, yIndex);

    ctx.beginPath();
    ctx.fillStyle = LightenDarkenColor(color, ldColor);
    ctx.rect(boxPos.x, boxPos.y, arrangementBoxWidth, arrangementBoxHeight);
    ctx.fill();

    if(drawOutline)
    {
        ctx.lineWidth = 2;
        ctx.strokeStyle = LightenDarkenColor(color, ldColor - 30);
        let lineOverlap = 0.5;
        
        ctx.beginPath();
        ctx.rect(boxPos.x + ctx.lineWidth * lineOverlap, boxPos.y + ctx.lineWidth * lineOverlap, arrangementBoxWidth - 2 * ctx.lineWidth * lineOverlap, arrangementBoxHeight - 2 * ctx.lineWidth * lineOverlap);
        ctx.stroke();
    }
}

function drawArrEditBox(ctx, startX, startY, section, index)
{
    let highlightDarken = hoveredEditBoxIndex == index ? arrEditBoxHoverColorShift : 0;
    let boxPos = getArrBoxPositionFromCoords(startX, startY, 0, index);
    let selectedOutlineHeight = -30 + highlightDarken;

    ctx.textAlign = "center";
    ctx.font = arrEditFont;
    ctx.textBaseline = "middle";

    //Draw box
    ctx.beginPath();
    ctx.fillStyle = LightenDarkenColor(section.color, 20 + highlightDarken);
    ctx.rect(boxPos.x, boxPos.y, noteWidth, arrangementBoxHeight);
    ctx.fill();

    //Draw "Edit" text
    ctx.fillStyle = arrEditTextColor;
    ctx.fillText("EDIT", boxPos.x + noteWidth / 2, boxPos.y + noteHeight / 2 + arrangementBoxPadding, noteWidth);
    
    //Draw Outline
    if(index == selectedEditBoxIndex)
    {
        ctx.lineWidth = 2;
        ctx.strokeStyle = LightenDarkenColor(section.color, selectedOutlineHeight);
        let lineOverlap = 0.5;
        
        ctx.beginPath();
        ctx.rect(boxPos.x + ctx.lineWidth * lineOverlap, boxPos.y + ctx.lineWidth * lineOverlap, noteWidth - 2 * ctx.lineWidth * lineOverlap, arrangementBoxHeight - 2 * ctx.lineWidth * lineOverlap);
        ctx.stroke();
    }
}

function drawArrangementPlayBar(ctx, startX, startY)
{
    let barWidth = 2;

    let barStartX = (arrangementBoxPadding + arrangementBoxWidth) * loopSelectionIndexes.start;
    let barEndX = (arrangementBoxPadding + arrangementBoxWidth) * loopSelectionIndexes.end;
        
    let fullWidth = barEndX - barStartX;
    let xPosition = Tone.Transport.progress * fullWidth + (arrangementBoxPadding + arrangementBoxWidth) * loopSelectionIndexes.start;

    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.rect(startX + xPosition + arrangementBoxPadding, startY + arrangementBoxPadding, -barWidth, arrangementBoxPadding * (sections.length - 1)  + arrangementBoxHeight * sections.length);
    ctx.fill();
}

function drawCreateArrangementBoxButton(ctx, startX, startY)
{
    let mouseHover = mouse.x > startX && mouse.x < startX + noteWidth && mouse.y > startY && mouse.y < startY + noteHeight;
    let shiftValue = 0;

    if(createBoxHovered)
        shiftValue = -10;

    //Draw Box
    ctx.beginPath();
    ctx.fillStyle = LightenDarkenColor(createArrBoxButtonColor, + shiftValue);
    ctx.rect(startX, startY, noteWidth, noteHeight);
    ctx.fill();

    //Draw Outline
    ctx.lineWidth = 2;
    ctx.strokeStyle = LightenDarkenColor("#919191", shiftValue);
    let lineOverlap = 0.5;
    
    ctx.beginPath();
    ctx.rect(startX + ctx.lineWidth * lineOverlap, startY + ctx.lineWidth * lineOverlap, noteWidth - 2 * ctx.lineWidth * lineOverlap, noteHeight - 2 * ctx.lineWidth * lineOverlap);
    ctx.stroke();

    //Draw + sign in the middle of the box
    ctx.textAlign = "center";
    ctx.font = createArrBoxFont;
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#ffffff";
    ctx.fillText("+", startX + noteWidth / 2, startY + noteHeight / 2 + arrangementBoxPadding, noteWidth);
}

function drawLoopBar(ctx, startX, startY)
{
    loopBarFullWidth = (arrangementBoxPadding + arrangementBoxWidth) * (numberOfPartsPerSong);
    let backgroundColor = loopBarHovered ? LightenDarkenColor(loopBarBackgroundColor, 20): loopBarBackgroundColor;
    let loopBarColor = loopBarHovered ? LightenDarkenColor(loopBarHandleColor, 50) : loopBarHandleColor;
    //Draw Underneath Box
    ctx.beginPath();
    ctx.fillStyle = backgroundColor;
    ctx.rect(startX, startY, loopBarFullWidth, loopBarHeight);
    ctx.fill();

    let leftBarIndex = loopStartIndex > loopEndIndex ? loopEndIndex : loopStartIndex;
    let rightBarIndex = loopStartIndex > loopEndIndex ? loopStartIndex : loopEndIndex;

    let leftPosition = 0;
    let rightPosition = 0;
    
    //Draw Handle Points
    for (let i = 0; i <= numberOfPartsPerSong; i++) {

        let xPos = 0;

        if(i == 0)
            xPos = startX;
        else if(i == numberOfPartsPerSong)
            xPos = startX + loopBarFullWidth - loopBarHandleWidth;
        else
            xPos = startX + (arrangementBoxPadding + arrangementBoxWidth) * i - arrangementBoxPadding / 2;
            

        let handleHoveredColor = loopBarHoveredIndex == i ? LightenDarkenColor(backgroundColor, -50) : backgroundColor;

        // Remove all background loop handles behind where the loop bar indicator is
        if(i < leftBarIndex || i > rightBarIndex)
            drawLoopBarHandle(ctx, xPos, startY, handleHoveredColor, i > 0 && i < numberOfPartsPerSong);

        if(i == leftBarIndex)
            leftPosition = xPos;
        if(i == rightBarIndex)
            rightPosition = xPos;
    }

    // Will look something like this:
    // |--------|--------|=================|--------|--------|--------|--------|

    //Draw Loop Bar -----

    ctx.beginPath();
    ctx.fillStyle = loopBarColor;
    ctx.rect(leftPosition, startY, rightPosition - leftPosition, loopBarHeight);
    ctx.fill();

    //Draw Left Handle
    drawLoopBarHandle(ctx, leftPosition, startY, loopBarColor, leftBarIndex != 0);

    //Draw Right Handle
    drawLoopBarHandle(ctx, rightPosition, startY, loopBarColor, rightBarIndex != numberOfPartsPerSong);
}

function drawLoopBarHandle(ctx, x, y, color, centered)
{
    let xPos = centered ? x - loopBarHandleWidth / 2 : x;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(xPos, y - loopBarHandleHeight / 4, loopBarHandleWidth, loopBarHandleHeight);
    ctx.fill();
}

// Selection Functions -------------------------------------

function editBoxSelection(startX, startY, width, height)
{
    let selection = gridSelection(startX, startY, noteWidth, noteHeight, arrangementBoxPadding, 1, sections.length, width, height);
    hoveredEditBoxIndex = selection.y;
    
    //Set the clicked selection to the hovered bank box
    if(selection.y != -1 && mouse.clickedDown)
        selectNewArrangementSection(selection.y);
}

function createArrBoxSelection(startX, startY, width, height)
{
    let selection = gridSelection(startX, startY, noteWidth, noteHeight, arrangementBoxPadding, 1, 1, width, height);

    createBoxHovered = false;

    //Set the clicked selection to the hovered bank box
    if(selection.y != -1)
    {
        if(mouse.clickedDown)
            AddNewSection();
        else
            createBoxHovered = true;
    }
}

function arrangementBoxSelection(startX, startY, width, height)
{
    targetArrangementBoxIndexes = gridSelection(startX, startY, arrangementBoxWidth, arrangementBoxHeight, arrangementBoxPadding, numberOfPartsPerSong, sections.length, width, height);
    let realIndex = targetArrangementBoxIndexes.x != -1 && targetArrangementBoxIndexes.y != -1;
    
    if(realIndex && mouse.clickedDown)
    {
        let sectionIndex = targetArrangementBoxIndexes.y;
        let timeIndex = targetArrangementBoxIndexes.x;
        let empty = !checkForSectionState(sectionIndex, timeIndex).filled;
        
        if(empty && selectedEditBoxIndex != -1) // The box is empty -> add a new box (if a bank box is selected)
            toggleSection(sectionIndex, timeIndex, true);
        else if(!empty)
            toggleSection(sectionIndex, timeIndex, false);
    }
}

function loopBarSelection(startX, startY)
{
    let inBoundsX = mouse.x > startX && mouse.x < startX + loopBarFullWidth;
    let inBoundsY = mouse.y > startY && mouse.y < startY + 20;

    loopBarHovered = inBoundsX && inBoundsY;

    if(loopBarHovered)
        loopBarHoveredIndex = getClosestLoopBarIndex(startX, mouse.x);
    else
        loopBarHoveredIndex = -1;

    if(mouse.clickedDown && loopBarHoveredIndex != -1){
        loopStartIndex = getClosestLoopBarIndex(startX, mouse.x);
        loopBarSelected = true;
    }

    if(!mouse.clicked & loopBarSelected)
    {
        loopBarSelected = false;

        if(loopStartIndex == loopEndIndex)
        {
            loopStartIndex = loopSelectionIndexes.start;
            loopEndIndex = loopSelectionIndexes.end;
        }
        else
        {
            if(loopStartIndex > loopEndIndex)
            {
                let temp = loopStartIndex;
                loopStartIndex = loopEndIndex;
                loopEndIndex = temp;
            }
    
            loopSelectionIndexes.start = loopStartIndex;
            loopSelectionIndexes.end = loopEndIndex;
            setLoopStartAndEnd(loopSelectionIndexes.start, loopSelectionIndexes.end);
        }
    }

    if(loopBarSelected)
        loopEndIndex = getClosestLoopBarIndex(startX, mouse.x);


}

function getClosestLoopBarIndex(startX, x)
{
    let closestDistance = Math.abs(x - loopBarHandleXPositionFromIndex(startX, 0));
    let closestIndex = 0;

    for (let i = 1; i <= numberOfPartsPerSong; i++) {
        loopBarHandleXPositionFromIndex(startX, i);
        let distance = Math.abs(x - loopBarHandleXPositionFromIndex(startX, i));

        if(distance < closestDistance)
        {
            closestDistance = distance;
            closestIndex = i;
        }
    }

    return closestIndex;
}

function loopBarHandleXPositionFromIndex(startX, i)
{
    return xPos = startX + (arrangementBoxPadding + arrangementBoxWidth) * i - arrangementBoxPadding / 2;
}

// Utility -------------------------------------------------

function checkForSectionState(sectionIndex, timeIndex)
{
    let sectionExists = sectionArangement[sectionIndex] != null;
    let objectExists = sectionExists && sectionArangement[sectionIndex][timeIndex] != null;
    let sectionEnabled = objectExists && sectionArangement[sectionIndex][timeIndex].enabled;

    return {exists: sectionExists, objectExists: objectExists, enabled: sectionEnabled, filled: sectionExists && objectExists && sectionEnabled};
}


function getArrBoxPositionFromCoords(startX, startY, x, y)
{
    let xPos = startX + arrangementBoxPadding + x * (arrangementBoxPadding + arrangementBoxWidth);
    let yPos = startY + arrangementBoxPadding + y * (arrangementBoxPadding + arrangementBoxHeight);

    return {x: xPos, y: yPos};
}

// Section Managment  --------------------------------------
function toggleSection(sectionIndex, timeIndex, on)
{
    let sectionState = checkForSectionState(sectionIndex, timeIndex);

    if(!sectionState.exists)
        sectionArangement[sectionIndex] = [];
    else if (sectionState.objectExists)
        sectionArangement[sectionIndex][timeIndex].dispose();

    var event = toggleSectionOnOff(timeIndex, sections[sectionIndex].part, on)
    sectionArangement[sectionIndex][timeIndex] = {dispose: event, enabled: on};
}

function selectNewArrangementSection(index)
{
    //Change the color of the text to corospond to the new color
    scaleTextColor = LightenDarkenColor(sections[index].color, -40);

    //Make the current part equal to the current section
    currentPart = sections[index];
    selectedEditBoxIndex = index;

    //setUpEditBox
    updateEditBoxForSection(sections[index]);
}

function AddNewSection()
{
    sections.push(createSection(defaultInstrument()));
    let sectionIndex = sections.length - 1;

    currentPart = sections[sectionIndex];

    selectNewArrangementSection(sectionIndex);

    for (let i = 0; i < numberOfPartsPerSong; i++) {
        toggleSection(sectionIndex, i, i == 0);
    }

    if(playingMusic)
        togglePlayPause();
}