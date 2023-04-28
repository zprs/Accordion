//Where all the user input is recorded

function updateUserInput()
{
    if(mouse.clickedDown && selectedNote.x != -1 && selectedNote.note != -1)
    {
        let changedNotes = [...user_toggleNote(selectedNote.x, selectedNote.note, currentPart)];
        
        let redoIndex = selectedNote.x;
        let redoNote = selectedNote.note;
        let redoLength = currentPart.noteGrid[selectedNote.x][selectedNote.note].noteLength;

        let redo = () => user_toggleNote(redoIndex, redoNote, currentPart, redoLength);

        let undo = function undoToggleNote() {
            for (let i = 0; i < changedNotes.length; i++) {
                const changedNote = changedNotes[i];
                changedNote.part.noteGrid[changedNote.x][changedNote.note] = {noteLength: changedNote.oldLength};
                UpdateNote(changedNote.part, changedNote.x, changedNote.note, changedNote.oldLength);
            }
        }

        act(redo, undo);
    }
}