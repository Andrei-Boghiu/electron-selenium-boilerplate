// Modules
const { app, BrowserWindow, ipcMain } = require("electron");
//const windowStateKeeper = require("electron-window-state");
const path = require("path");

// global reference of the window object
let mainWindow;

function createMainWindow() {
  // window state keeper
  // let state = windowStateKeeper({
  //   defaultWidth: 800,
  //   defaultHeight: 650,
  // });

  mainWindow = new BrowserWindow({
    // x: state.x,
    // y: state.y,
    width: 700, //state.width,
    height: 700, //state.height,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // load the html file into the new BrowserWindow
  mainWindow.loadFile(`renderer/index.html`);

  // Open Dev Tools - To Be Removed for Production
  //mainWindow.webContents.openDevTools();

  // listening for ipcRenderer request from renderer app.js to send in preload.js
  ipcMain.on("start-selenium-automation-to-main", (e, data) => {
    // send it to preload.js
    mainWindow.webContents.send("start-selenium-automation-to-preload", data);
  });

  ipcMain.on("start-selenium-automation-success-to-main", (e, data) => {
    mainWindow.webContents.send(
      "start-selenium-automation-success-to-renderer",
      data
    );
  });

  // (app -> main -> preload)
  ipcMain.on("stop-selenium-automation-to-main", (e, data) => {
    // send it to preload.js
    mainWindow.webContents.send("stop-selenium-automation-to-preload", data);
  });

  // (app <- main <- preload)
  ipcMain.on("stop-selenium-automation-to-main", (e, data) => {
    mainWindow.webContents.send("stop-selenium-automation-to-renderer", data);
  });

  ipcMain.on("info-for-logs-to-main", (e, data) => {
    mainWindow.webContents.send("info-for-logs-to-renderer", data);
  });

  // Listen for the window being closed
  mainWindow.on("close", () => {
    mainWindow.webContents.send("stop-selenium-automation-to-preload", "stop");
    mainWindow = null;
  });
}

// when app is ready, create main window
app.on("ready", createMainWindow);

// when all window instances are closed, quit the app
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// when app icon is clicked and app is running, recreate BrowserWindow
app.on("activate", () => {
  if (mainWindow === null) createMainWindow();
});
