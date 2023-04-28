document.addEventListener("keydown", event => {
    switch(event.key)
    {
        case "[" :
            if(noteLength > 1)
                noteLength--;
            break;
        case "]" :
            if(noteLength < maxNoteLength)
                noteLength++;
            break;
        case " ": //spacebar
            event.preventDefault()
            togglePlayPause();
        break;
    }

    if (event.metaKey && event.key === 'z') {

        if(event.shiftKey)
            redo();
        else
            undo();
    }
});

document.addEventListener("keypress", event => {
    switch(event.key)
    {
        
    }
});

document.addEventListener("keyup", event => {
    switch(event.key)
    {
        
    }
});