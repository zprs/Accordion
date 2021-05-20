const { ipcRenderer } = require('electron');

function saveFile()
{
    let data = Object.assign({}, fileJSONCreation());

    console.log(data);

    ipcRenderer.send("saveFile", data);
}

function openFile()
{
    var data = {};
    ipcRenderer.send("openFile", data);
}

ipcRenderer.on('openFileReply', (event, data) => {
    fileOpenJSONParse(data);
});

function fileJSONCreation()
{
    let obj = {sections: [], sectionArangement: []};
    
    sections.map((section) => {

        let smallNoteGrid = Object.keys(section.noteGrid).map( x => {
            
            let enabledNotes = {};
            
            Object.keys(section.noteGrid[x]).map( note => {
    
                if(section.noteGrid[x][note].noteLength > 0)
                    enabledNotes[note] = section.noteGrid[x][note];
            });
                
            return enabledNotes;
        });

        // smallNoteGrid = smallNoteGrid.filter(item => Object.keys(item).length != 0);

        obj.sections.push(
            {
                partObj: section.partObj,
                noteGrid: smallNoteGrid,
                color: section.color,
                instrument: section.instrument,
                instrumentType: section.instrumentType,
                volume: section.volume.value,
                scale: section.scale,
                scaleType: section.scaleType
            }
        )
    });

    obj.sectionArangement = sectionArangement.map((section) => {
        return section.map((enabledObj) => {
            return {enabled: enabledObj.enabled};
        })
    });

    obj.currentPart = sections.indexOf(currentPart);

    obj.bpm = Tone.Transport.bpm.value;
    obj.timeSig = {top: timeSignatureTop, bot: timeSignatureBot};
    obj.measuresPerPart = measuresPerPart;

    return obj;
}

function fileOpenJSONParse(obj)
{
    sectionArangement = [];
    sections = [];

    SetTimeSignature(obj.timeSig.top, obj.timeSig.bot);
    changeMeasuresPerPart(obj.measuresPerPart);
    SetBPM(obj.bpm);

    obj.sections.map((section, i) => {
        fullNoteGrid = {};

        for(let x = 0; x < noteColumnCount; x++)
        {
            fullNoteGrid[x] = {};

            for(let y = 0; y < noteRowCount; y++)
            {
                let note = cooridantesToNoteValue(y);

                let noteExists = section.noteGrid[x] && section.noteGrid[x][note];
                fullNoteGrid[x][note] = noteExists ? section.noteGrid[x][note] : {noteLength: 0};
            }
        }

        section.noteGrid = fullNoteGrid;

        AddNewSection(section, obj.sectionArangement[i]);
    });

    selectNewArrangementSection(obj.currentPart);
}



// NOT FILE MANAGMENT RELATED -- IPC NEEDS ITS OWN CLASS

ipcRenderer.on('openFileReply', (event, data) => {
    fileOpenJSONParse(data);
});