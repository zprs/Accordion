function UpdateNote(section, x, note, length)
{
    let time = cooridantesToNoteTiming(x);

    if(length > 0)
    {
        let formatedNoteLength = lengthToBeats(length);

        console.log("Length: " + length);
        AddNote(section.part, section.partObj, time, note, formatedNoteLength, 1);
    }
    else
        RemoveNote(section.part, section.partObj, time, note);
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
        partObj[time] = {notes: {}};
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
        console.log("nothing here m8");
        return;
    }

    console.log(note + ", " + time);
    part.remove(time);
    
    if(note != null)
    {
        delete partObj[time].notes[note];

        let obj = {time: time, notes: partObj[time].notes};

        if(Object.keys(obj.notes).length > 0)
            part.add(obj);
    }
    else
        delete partObj[time];

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

function cooridantesToCurrentNoteValue(y)
{
    let currentScale = scales[currentPart.scaleType][currentPart.scale];

    let octave = Math.floor((noteRowCount - 1 - y) / currentScale.length) + startingOctave;
    let scaleNoteIndex = (noteRowCount - 1 - y) % currentScale.length; 
    return currentScale[scaleNoteIndex] + octave;
}

function cooridantesToNoteValue(y)
{
    let rowCount = allKeys.length * numberOfOctaves;

    let octave = Math.floor((rowCount - 1 - y) / allKeys.length) + startingOctave;
    let scaleNoteIndex = (rowCount - 1 - y) % allKeys.length; 
    return allKeys[scaleNoteIndex] + octave;
}


function cooridantesToNoteTiming(x)
{
    //1:1:2 means measure 2, beat 2, 3rd sixteenth.
    let bars = Math.floor(x / timeSignatureTop);
    let beats = x % timeSignatureTop;
    let sixteenths = 0; // to be implemented later in some form

    return bars + ":" + beats + ":" + sixteenths
}