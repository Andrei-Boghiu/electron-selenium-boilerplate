// Modules
const { app, BrowserWindow, ipcMain } = require("electron");
const windowStateKeeper = require("electron-window-state");
const path = require("path");

// global reference of the window object
let mainWindow;

function createMainWindow() {
  // window state keeper
  let state = windowStateKeeper({
    defaultWidth: 100,
    defaultHeight: 650,
  });

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
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

  // manage new window state
  state.manage(mainWindow);

  // Open Dev Tools - To Be Removed for Production
  mainWindow.webContents.openDevTools();

  // // listening for ipcRenderer request from renderer app.js to send in preload.js
  ipcMain.on("start-selenium-automation", (e, data) => {
    console.log(data);
    console.log("data received in main process:" + data);

    // send it to preload.js
    mainWindow.webContents.send("start-selenium-data", data);
  });

  ipcMain.on("info-for-logs", (e, data) => {
    console.log("info-for-logs received in main.js:");
    console.log(data);

    mainWindow.webContents.send("info-for-logs", data);
  });

  // Listen for the window being closed
  mainWindow.on("close", () => {
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
