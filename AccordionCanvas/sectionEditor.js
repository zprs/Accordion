function setUpDropdowns(section)
{
    $("#instrumentTypeSelector").empty();

    let instrumentTypes = Object.keys(instruments);
    instrumentTypes.map((type) => {
        var newOption = $('<option value="'+type+'">'+type+'</option>');
        $('#instrumentTypeSelector').append(newOption);
    });

    $("#scaleTypeSelector").empty();

    let scalesTypes = Object.keys(scales);
    scalesTypes.map((type) => {
        var newOption = $('<option value="'+type+'">'+type+'</option>');
        $('#scaleTypeSelector').append(newOption);
    });

    $("#scaleTypeSelector").val(section.scaleType)
    
    resetInstrumentDropdown(section);
    resetScaleDropdown(section);
}

function resetScaleDropdown(section)
{
    $("#scaleSelector").empty();

    let scalesKey = Object.keys(scales[section.scaleType]);
    scalesKey.map((scale) => {
        var newOption = $('<option value="'+scale+'">'+scale+'</option>');
        $('#scaleSelector').append(newOption);
    });
    
    $("#scaleSelector").val(section.scale);
}

function resetInstrumentDropdown(section)
{
    $("#instrumentSelector").empty();

    let instrumentsVals = Object.keys(instruments[section.instrumentType]);

    instrumentsVals.map((inst) => {
        var newOption = $('<option value="'+inst+'">'+inst+'</option>');
        $('#instrumentSelector').append(newOption);
    });

    $("#instrumentTypeSelector").val(section.instrumentType);
}

function updateEditBoxForSection(section)
{
    updateEditSectionBoxColor();
    setUpDropdowns(section);
    $("#sectionVolume").val(section.volume.value);
    $("#sectionColorPicker").val(section.color);
}

function updateSectionColor()
{
    currentPart.color = $("#sectionColorPicker").val();
    updateEditSectionBoxColor();
}

function updateEditSectionBoxColor()
{
    $("#sectionEditorContainer").css('background-color', LightenDarkenColor(currentPart.color, 100));
}

//Value Change Events --------

$("#sectionVolume").change(() => {

    let volume = $("#sectionVolume").val()
    console.log(volume);
    changeSectionVolume(volume);
});

//Instrument Changes
$("#instrumentTypeSelector").change(() => {
    let type = $("#instrumentTypeSelector").val();
    let firstInstrument = Object.keys(instruments[type])[0];

    updateSectionInstrument(type, firstInstrument);
    setUpDropdowns(currentPart);
});

$("#instrumentSelector").change(() => {
    let type = $("#instrumentTypeSelector").val();
    let val = $("#instrumentSelector").val();

    updateSectionInstrument(type, val);
});

//Scale Changes
$("#scaleTypeSelector").change(() => {
    let type = $("#scaleTypeSelector").val();
    changeSectionScale(type, currentPart.scale, currentPart);
});

$("#scaleSelector").change(() => {
    let scale = $("#scaleSelector").val();

    changeSectionScale(currentPart.scaleType, scale, currentPart);
});

//----------------------------

function updateSectionInstrument(type, val)
{
    currentPart.instrumentType = type;
    currentPart.instrument = val;
    currentPart.instrumentObj = instruments[type][val]();
}

function changeSectionVolume(val)
{
    currentPart.volume.value = val;
    currentPart.instrumentObj.volume.value = val;
}


//Piece Editor

function showEditSongProperties()
{
    $("#bpmInput").val(Tone.Transport.bpm.value);
    $("#measuresPerSectionInput").val(measuresPerPart);
    $("#timeSignatureTopInput").val(timeSignatureTop);
    $("#timeSignatureBotInput").val(timeSignatureBot);
    $('#songPropertiesContainer').show();
}

function applyPropertiesEdit()
{

    let newMeasuresPerPart = Math.floor($("#measuresPerSectionInput").val());
    let newTSTop = $("#timeSignatureTopInput").val();
    let newTSBot = $("#timeSignatureBotInput").val()

    let tsChanged = (newTSTop != timeSignatureTop) || (newTSBot != timeSignatureBot);
    let mppChanged = measuresPerPart != newMeasuresPerPart;

    let crucialChange = tsChanged || mppChanged
    let confirmChange = true;

    if(crucialChange)
    {
        let data = {
            message: "This action has a high potential to delete notes in your song and cannot be undone",
            "confirm": "Apply",
            "deny": "Cancel"
        }

        confirmChange = ipcRenderer.sendSync("warning", data);
    }

    if(!crucialChange || crucialChange && confirmChange)
    {
        SetBPM(Math.round($("#bpmInput").val()));
        measuresPerPart = newMeasuresPerPart; // measures per part gets updated in the SetTiemSignature function
        SetTimeSignature(newTSTop, newTSBot);
        $('#songPropertiesContainer').hide();
    }
}
