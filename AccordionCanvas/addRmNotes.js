function UpdateNote(x, y, enabled, length)
{
    let time = cooridantesToNoteTiming(x);
    let note = cooridantesToNoteValue(y);

    if(enabled)
    {
        let formatedNoteLength = lengthToBeats(length);

        console.log("Length: " + length);
        AddNote(currentPart.part, currentPart.partObj, time, note, formatedNoteLength, 1);
    }
    else
        RemoveNote(currentPart.part, currentPart.partObj, time, note);
}

function AddAllNotesInPartObj(part, partObj)
{
    let timeStamps = Object.keys(partObj);

    for (let i = 0; i < timeStamps.length; i++) {
        const time = timeStamps[i];
        
        let obj = {time: time, notes: partObj[time].notes};
        part.add(obj);
    }
}

function AddNote(part, partObj, time, note, length, velocity)
{
    //No note exists in this time slot yet
    if(!partObj[time])
    {
        partObj[time] = {notes: {}};
    }
    else
        part.remove(time);

    let newNote = {length: length, velocity: velocity};
    partObj[time].notes[note] = (newNote);

    let obj = {time: time, notes: partObj[time].notes};
    part.add(obj);
}

function RemoveNote(part, partObj, time, note)
{
    if(!partObj[time]) //There should be a note there. If there isn't, something is wrong
    {
        console.log("nothing here m8")
        return;
    }
    else
    {
        delete partObj[time].notes[note];
        part.remove(time);

        let obj = {time: time, notes: partObj[time].notes};

        if(Object.keys(obj.notes).length > 0)
            part.add(obj);
    }
}

function lengthToBeats(length)
{
    switch(length)
    {
        case 1:
            return "4n";
        case 2:
            return "2n";
        case 3:
            return 1;
        case 4:
            return "1m";
        
    }

    return length / 4;
}

function cooridantesToNoteValue(y)
{
    let octave = Math.floor((noteRowCount - 1 - y) / currentScale.length) + startingOctave;
    let scaleNoteIndex = (noteRowCount - 1 - y) % currentScale.length; 
    return currentScale[scaleNoteIndex] + octave;
}

function cooridantesToNoteTiming(x)
{
    //1:1:2 means measure 2, beat 2, 3rd sixteenth.
    let bars = Math.floor(x / notesPerMeasure);
    let beats = x % notesPerMeasure;
    let sixteenths = 0; // to be implemented later in some form

    return bars + ":" + beats + ":" + sixteenths
}