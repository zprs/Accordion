// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});


//Accept incoming comms from other process

let defaultExtension = "accordion";

ipcMain.on('saveFile', (event, data) => {

  let options = {
    message: "Save Music File As"
  };

  dialog.showSaveDialog(mainWindow, options).then((response) =>
  {
    if(response.canceled)
      return;

    let filePath = fixPath(response.filePath);

    if(fs.existsSync(filePath))
      dialog.showMessageBox(mainWindow, {message: "There is already a file in this location with the same name", buttons: ["Cancel", "Overwrite"]}).then((overwriteResponseIndex) =>
      {
        if(overwriteResponseIndex.response == 1)
          writeFile(filePath, data);
      })
    else
      writeFile(filePath, data);
    
  });
});

function fixPath(fpath)
{
  let ext = fpath.split('.').pop();

  if(ext != defaultExtension)
    fpath += "." + defaultExtension;

  return fpath;
  
}

function writeFile(filePath, data)
{
  fs.writeFile(filePath, JSON.stringify(data), (err) =>
  {
    if (err) 
      console.log(err);
    else
      console.log("success writing file");
  
  });
}

ipcMain.on('openFile', (event, data) => {

  let options = {
    message: "Open music file",
    filters: [
      { name: 'musicFiles', extensions: [defaultExtension] }
    ]
  };

  dialog.showOpenDialog(mainWindow, options).then((response) =>
  {
    if(response.canceled)
      return;

    fs.readFile(response.filePaths[0], 'utf8' , (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      
      let obj = {};
      let success = false;

      try{
        obj = JSON.parse(data);
        success = true;
      }
      catch
      {
        dialog.showMessageBox(mainWindow, {message: "The file is unable to be parsed", type: "error"});
        console.log("JSON Object not able to be parsed. File is corrupted.");
        success = false;
      }

      if(success)
      {
        console.log("file loaded, sending reply to renderer");
        console.log(event);
        event.reply('openFileReply', obj);
      }
      else
        console.log("big sad :(");
    })

  });
});