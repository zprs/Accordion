
//Requirements
const Tone = require("tone");
const $ = require( "jquery" );

//A single A single "Tone.Transport" is created for you when the library is initialized. Defaults listed below:
// DEFAULTS: {
//     bpm : 120 ,
//     swing : 0 ,
//     swingSubdivision : 8n ,
//     timeSignature : 4 ,
//     loopStart : 0 ,
//     loopEnd : 4m ,
//     PPQ : 192
//     }

// 2D array of how sections are arranged
let sectionArangement = [];
// 1D array of all of the sections
let sections = [];

//DefaultInstrument instrument
let defaultInstrumentType = "synth";
let defaultInstrument = "triangle";

let measuresPerPart = 4;
let numberOfPartsPerSong = 8;

let timeSignatureTop = 4;
let timeSignatureBot = 4;

let numberOfOctaves = 4;
let startingOctave = 2;

Tone.Transport.loop = true;
Tone.Transport.loopEnd = measuresPerPart * numberOfPartsPerSong + "m";

let defaultScaleType = "Chromatic";
let defaultScaleKey = "C";
let allNoteScale = scales["Chromatic"]["C"];

//Number of notes in the note grid
let noteColumnCount;
let noteRowCount;

function setNoteColumCount() { noteColumnCount = timeSignatureTop * measuresPerPart + 1 };  //plus one for the scale column
function setNoteRowCount(section) { noteRowCount = scales[section.scaleType][section.scale].length * numberOfOctaves };

function setNoteCount(section)
{
    setNoteColumCount();
    setNoteRowCount(section);
}

let playingMusic = false;
let currentPart = null;

//This will be used as our "blocks" of music that are able to be played
function createSection(instrumentType, instrument)
{
    let color = noteHighlightedColors[sections.length];

    let createdPart = {
        part: null,
        partObj: {}, //When adding a note to the part, we also add it to this object (A way to save the state because it is hard to get values back out of part once they are put in)
        instrumentObj: null,
        noteGrid: {},
        color: color,
        instrument: instrument,
        instrumentType: "synth",
        volume: null,
        scale: defaultScaleKey,
        scaleType: defaultScaleType
    }

    setNoteCount(createdPart);

    for(let x = 0; x < noteColumnCount; x++)
    {
        createdPart.noteGrid[x] = {};

        for(let y = 0; y < allKeys.length * numberOfOctaves; y++)
        {
            let note = cooridantesToNoteValue(y);
            createdPart.noteGrid[x][note] = {noteLength: 0};
        }
    }

    createdPart.instrumentObj = instruments[createdPart.instrumentType][createdPart.instrument]();
    createdPart.volume = createdPart.instrumentObj.volume;
    createdPart.part = newPart(createdPart);
    
    createdPart.part.loop = true;
    createdPart.part.loopEnd = measuresPerPart + "m";

    sections.push(createdPart);

}

function newPart(part)
{
    return new Tone.Part(function(time, value){

        let noteKeys = Object.keys(value.notes);

        for(let i = 0; i < noteKeys.length; i++)
        {   
            let note = noteKeys[i];
            let noteObj = value.notes[note];
            part.instrumentObj.triggerAttackRelease(note, noteObj.length, time, 0.5);
        }
    });
}

function createSectionFromTemplate(obj)
{
    let instrument = instruments[obj.instrumentType][obj.instrument]();

    let createdPart = {
        part: null,
        partObj: obj.partObj, //When adding a note to the part, we also add it to this object (A way to save the state because it is hard to get values back out of part once they are put in)
        instrumentObj: instrument,
        noteGrid: obj.noteGrid,
        color: obj.color,
        instrument: obj.instrument,
        instrumentType: obj.instrumentType,
        volume: instrument.volume,
        scale: obj.scale,
        scaleType: obj.scaleType
    }

    createdPart.volume.value = obj.volume;
    
    createdPart.part = newPart(createdPart);
    createdPart.part.loop = true;
    createdPart.part.loopEnd = measuresPerPart + "m";

    sections.push(createdPart);

    AddAllNotesInPartObj(createdPart.part, createdPart.partObj);
}

function SetTimeSignature(_timeSignatureTop, _timeSignatureBot) { 
    Tone.Transport.timeSignature = [_timeSignatureTop, _timeSignatureBot]; 
    timeSignatureTop = _timeSignatureTop; 
    timeSignatureBot = _timeSignatureBot;

    noteColumnCount = timeSignatureTop * measuresPerPart + 1;
    changeMeasuresPerPart(measuresPerPart);
}
function SetBPM(bpm) { Tone.Transport.bpm.value = bpm; }

function setLoopStartAndEnd(startIndex, endIndex)
{
    Tone.Transport.loopStart = startIndex * measuresPerPart + "m";
    Tone.Transport.loopEnd =  endIndex * measuresPerPart + "m";

    Tone.Transport.position = Tone.Transport.loopStart;
}

function togglePlayPause()
{
    if(playingMusic)
    {
        Tone.Transport.stop();
        Tone.Transport.position = Tone.Transport.loopStart;
        sections.map((element) => { element.part.stop()});
    }
    else
    {
        Tone.Transport.start("+0", "0:0:0");
        Tone.Transport.position = Tone.Transport.loopStart;
        sections.map((element) => { element.part.start("+0")});
    }

    playingMusic = !playingMusic;
}

function changeMeasuresPerPart(val)
{
    measuresPerPart = val;
    noteColumnCount = measuresPerPart * timeSignatureTop + 1;

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        section.part.loopEnd = measuresPerPart + "m";
        adjustSectionWidth(noteColumnCount, section);

        let sectionIndex = sections.indexOf(section);
        updateSectionEnabled(sectionIndex, sectionArangement[sectionIndex]);
    }

    setLoopStartAndEnd(loopSelectionIndexes.start, loopSelectionIndexes.end);
}

function changeSectionScale(scaleType, scale, section)
{
    updateNotesToNoteScale(section, scales[scaleType][scale]);
    
    section.scaleType = scaleType;
    section.scale = scale;
    setNoteCount(section);
    updateNoteGridHeight(); //update the canvas height
}

function updateNotesToNoteScale(section, newScale)
{
    var currentScale = scales[section.scaleType][section.scale];

    //Remove all note play events from part that will be removed when the notgrid is changed
    for (let x = 0; x < Object.keys(section.noteGrid).length; x++) {
        for (let y = 0; y < Object.keys(section.noteGrid[x]).length; y++) {
            let noteValue = cooridantesToNoteValue(y);

            if(section.noteGrid[x][noteValue])
            {
                let noteLength = section.noteGrid[x][noteValue].noteLength;
                let noteEnabled = noteLength > 0;
    
                if(noteEnabled)
                {
                    //slice to remove the last char to remove the octave digit
                    let setNoteLength = newScale.includes(noteValue.slice(0, -1)) ? noteLength : 0 ;
                    //if the note is in the current scale, set it to its note length (enable it), else, set note lenght to 0 (disable it)
                    UpdateNote(section, x, noteValue, setNoteLength);
                }
            }
            else
                console.log("wtf bro");

        }   
    }
}

function adjustSectionWidth(x, section)
{
    let currentWidth = Object.keys(section.noteGrid).length;

    //Adding Columns
    if(currentWidth < x)
    {
        for (let i = currentWidth; i < x; i++) {
            section.noteGrid[i] = {};
            
            for (let y = 0; y < noteRowCount; y++) {
                section.noteGrid[i][y] = {noteLength: 0};
            }
        }
    }
    else if (currentWidth > x) // Removing columns
    {
        for (let i = x - 1; i < currentWidth; i++) {
            RemoveNote(section.part, section.partObj, cooridantesToNoteTiming(i));
            clearNoteColumn(section.noteGrid, i);
        }
    }
}

function clearNoteColumn(noteGrid, x)
{
    for (let y = 0; y < noteRowCount; y++) {
        noteGrid[x][y] = {noteLength: 0};
    }
}

//SCHEDULING NOTE SECTONS ---------------

function toggleSectionOnOff(timeIndex, part, on)
{
    let measure = measuresPerPart * timeIndex;
    
    var eventId = Tone.Transport.schedule(function(time) {
        part.mute = !on;
    }, measure + "m");

    console.log(measure + "m");
    
    //disposal function
    return () => {
        Tone.Transport.clear(eventId);
        // Tone.Transport._scheduledEvents[eventId];
    }
}
