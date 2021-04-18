function setUpDropdowns(section)
{
    $("#instrumentTypeSelector").empty();

    let instrumentTypes = Object.keys(instruments);
    instrumentTypes.map((type) => {
        var newOption = $('<option value="'+type+'">'+type+'</option>');
        $('#instrumentTypeSelector').append(newOption);
    });
    
    resetInstrumentDropdown(section);
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