function UpdateNote(x, y, enabled, length)
{
    var time = cooridantesToNoteTiming(x);
    var note = cooridantesToNoteValue(y);

    if(enabled)
    {
        var formatedNoteLength = lengthToBeats(length);

        console.log("Length: " + length);
        AddNote(currentPart.part, currentPart.partObj, time, note, formatedNoteLength, 1);
    }
    else
        RemoveNote(currentPart.part, currentPart.partObj, time, note);
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

    var newNote = {length: length, velocity: velocity};
    partObj[time].notes[note] = (newNote);

    let obj = {time: time, notes: partObj[time].notes};
    part.add(obj);

    console.log(time);
}

function RemoveNote(part, partObj, time, note)
{
    if(!partObj[time]) //There shouldnt be any notes there. If so something is wrong
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
    var octave = Math.floor((noteRowCount - 1 - y) / currentScale.length) + startingOctave;
    var scaleNoteIndex = (noteRowCount - 1 - y) % currentScale.length; 
    return currentScale[scaleNoteIndex] + octave;
}

function cooridantesToNoteTiming(x)
{
    //1:1:2 means measure 2, beat 2, 3rd sixteenth.
    var bars = Math.floor(x / notesPerMeasure);
    var beats = x % notesPerMeasure;
    var sixteenths = 0; // to be implemented later in some form

    return bars + ":" + beats + ":" + sixteenths
}