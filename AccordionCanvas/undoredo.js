let actionIndex = -1; //Action index is the pointer to the action that just occoured.
let actionTrace  = [];

//Takes in two functions as parameters, an action and an action that undoes that action.
function act(action, reverseAction)
{
    actionTrace = actionTrace.slice(0, actionIndex + 1); //Removes all further actions past the current action from the aciton trace.
    addActionToTrace(action, reverseAction);
    actionIndex++;
}

function addActionToTrace(action, reverseAction)
{
    actionTrace.push({action: action, reverse: reverseAction});
}

function undo()
{
    if(actionIndex == -1)
        return; 

    actionTrace[actionIndex].reverse();
    actionIndex--;
}

function redo()
{
    if(actionTrace.length <= actionIndex + 1) //No further actions to redo. At the end of the trace.
        return;   

        
    actionTrace[actionIndex + 1].action();
    actionIndex++;
}