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
    $("#sectionVolume").val(section.volume);
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

$("#sectionVolume").change(() => {

    let volume = $("#sectionVolume").val()
    console.log(volume);
    changeSectionVolume(volume / 2 - 25);
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


function updateSectionInstrument(type, val)
{
    currentPart.instrumentType = type;
    currentPart.instrument = val;
    currentPart.instrumentObj = instruments[type][val]();
}

function changeSectionVolume(val)
{
    currentPart.volume = val;
    currentPart.instrumentObj.volume.value = val;
}