try {
  const { contextBridge, ipcRenderer } = require("electron");
  const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
  //const chrome = require("selenium-webdriver/chrome");
  //const path = require("path");
  const webdriver = require("selenium-webdriver");
  //const firefox = require("selenium-webdriver/firefox");

  console.log(process.type);

  const geckoPath = "./driver/geckodriver";

  process.env.WEBDRIVER_GECKO_DRIVER = geckoPath;

  // Expose required Node.js modules to the renderer process
  contextBridge.exposeInMainWorld("contextBridgeIpcRenderer", {
    ipcRenderer: {
      send: (channel, data) => {
        ipcRenderer.send(channel, data);
      },
      on: (channel, data) => {
        ipcRenderer.on(channel, data);
      },
    },
  });

  // logType: success / failure
  function sendLog(logType, info) {
    ipcRenderer.send("info-for-logs-to-main", { logType, info });
  }

  // Listener receiving data from main.js that comes from renderer app
  ipcRenderer.on("start-selenium-automation-to-preload", (e, data) => {
    console.log("message received in preload:");
    console.log(data);
    console.log(data.username);
    console.log(data.url);
    console.log(data.searchQuery);

    (async function automation() {
      //let driver = await new Builder().forBrowser(Browser.FIREFOX).build();

      const driver = new webdriver.Builder().forBrowser("firefox").build();

      sendLog("success", "Selenium instance launched successfully");

      // tell the app that selenium launched successfully
      ipcRenderer.send("start-selenium-automation-success-to-main", "Success");
      // listen for stop command
      ipcRenderer.on("stop-selenium-automation-to-preload", async (e, data) => {
        await driver.quit();
        ipcRenderer.send("stop-selenium-automation-to-main", "Success");
      });

      await driver.get(`${data.url}`);

      sendLog("success", "Search on google performed successfully");

      await new Promise((resolve) => setTimeout(resolve, 1500));

      await driver.findElement(By.css("#L2AGLb")).click();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await driver
        .findElement(By.css("[name='q']"))
        .sendKeys(`${data.searchQuery}`, Key.RETURN);
      sendLog("success", "No matching results found");
    })();
  });
} catch (error) {
  alert(error);
}
