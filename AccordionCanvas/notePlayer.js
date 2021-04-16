
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

//Temporary instrument
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

let notesPerMeasure = 4;
let measurePerPart = 4;
let numberOfPartsPerSong = 8;
let numberOfOctaves = 5;
let startingOctave = 2;

Tone.Transport.timeSignature = 4;
Tone.Transport.loop = true;
Tone.Transport.loopEnd = measurePerPart * numberOfPartsPerSong + "m";

//To be changed to the actual values of scale
let currentScale = chromaticScales["C"];

//Number of notes in the note grid
let noteColumnCount = notesPerMeasure * measurePerPart + 1; //plus one for the scale column
let noteRowCount = currentScale.length * numberOfOctaves;

let playingMusic = false;
let currentPart = null;

//This will be used as our "blocks" of music that are able to be played
function createSection(instrument)
{
    let part = new Tone.Part(function(time, value){

        let noteKeys = Object.keys(value.notes);

        for(let i = 0; i < noteKeys.length; i++)
        {   
            let note = noteKeys[i];
            let noteObj = value.notes[note];
            instrument.triggerAttackRelease(note, noteObj.length, time, 0.5);
        }
    });

    part.loop = true;
    part.loopEnd = measurePerPart + "m";

    let newNoteGrid = {};

    for(let x = 0; x < noteColumnCount; x++)
    {
        newNoteGrid[x] = {};

        for(let y = 0; y < noteRowCount; y++)
        {
            newNoteGrid[x][y] = {enabled: false, noteLength: 0};
        }
    }
    
    let color = noteHighlightedColors[sections.length];

    let createdPart = {
        part: part,
        partObj: {}, //When adding a note to the part, we also add it to this object (A way to save the state because it is hard to get values back out of part once they are put in)
        noteGrid: newNoteGrid,
        color: color
    }


    return createdPart;
}

function SetTimeSignature(timeSignatureTop, timeSignatureBot) { Tone.Transport.timeSignature = [timeSignatureTop, timeSignatureBot]; }
function SetBPM(bpm) { Tone.Transport.bpm.value = bpm; }

function setLoopStartAndEnd(startIndex, endIndex)
{
    Tone.Transport.loopStart = startIndex * measurePerPart + "m";
    Tone.Transport.loopEnd =  endIndex * measurePerPart + "m";

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

//SCHEDULING NOTE SECTONS ---------------


//returns the event created
function toggleSectionOnOff(timeIndex, part, on)
{
    let measure = measurePerPart * timeIndex;
    
    var eventId = Tone.Transport.schedule(function(time) {
        part.mute = !on;
    }, measure + "m");
    
    //disposal function
    return () => {
        delete Tone.Transport._scheduledEvents[eventId];
    }
}
