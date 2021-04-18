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
            
            Object.keys(section.noteGrid[x]).map( y => {
                
                if(section.noteGrid[x][y].enabled)
                    enabledNotes[y] = section.noteGrid[x][y];
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
                volume: section.volume.value
            }
        )
    });

    obj.sectionArangement = sectionArangement.map((section) => {
        return section.map((enabledObj) => {
            return {enabled: enabledObj.enabled};
        })
    });

    obj.currentPart = sections.indexOf(currentPart);

    return obj;
}

function fileOpenJSONParse(obj)
{
    sectionArangement = [];
    sections = [];

    obj.sections.map((section, i) => {
        fullNoteGrid = {};

        for(let x = 0; x < noteColumnCount; x++)
        {
            fullNoteGrid[x] = {};

            for(let y = 0; y < noteRowCount; y++)
            {
                let noteExists = section.noteGrid[x] && section.noteGrid[x][y];
                fullNoteGrid[x][y] = noteExists ? section.noteGrid[x][y] : {enabled: false, noteLength: 0};
            }
        }

        section.noteGrid = fullNoteGrid;

        AddNewSection(section, obj.sectionArangement[i]);
    });

    selectNewArrangementSection(obj.currentPart);
}