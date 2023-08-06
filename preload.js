const { contextBridge, ipcRenderer } = require("electron");
const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const path = require("path");

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

// Listener receiving data from main.js that comes from renderer app
ipcRenderer.on("start-selenium-data", (e, data) => {
  console.log("message received in preload:");
  console.log(data);
  console.log(data.linkVale);
  console.log(data.searchQueryValue);
  console.log(data.testValue);

  (async function automation() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();

    await driver.get(`${data.linkVale}`);

    ipcRenderer.send("info-for-logs", "Link loaded successfully");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await driver.findElement(By.css("#L2AGLb")).click();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await driver
      .findElement(By.css("[name='q']"))
      .sendKeys(`${data.searchQueryValue}`, Key.RETURN);
  })();
});

// Second possible method to run the automation in renderer app (not recommended)
// contextBridge.exposeInMainWorld("mySeleniumAPI", {
//   driver: {
//     navigate: async (url) => {
//       await driver.navigate().to(url);
//     },
//     findElement: async (selector) => {
//       return await driver.findElement(By.css(selector));
//     },
//     findElements: async (selector) => {
//       return await driver.findElements(By.css(selector));
//     },
//     click: async (element) => {
//       await element.click();
//     },
//     sendKeys: async (element, keys) => {
//       await element.sendKeys(keys);
//     },
//     getText: async (element) => {
//       return await element.getText();
//     },
//     getTitle: async () => {
//       return await driver.getTitle();
//     },
//     waitForElement: async (selector, timeout = 5000) => {
//       const element = await driver.wait(
//         until.elementLocated(By.css(selector)),
//         timeout
//       );
//       return await driver.wait(until.elementIsVisible(element), timeout);
//     },
//     // Add other necessary methods from the Selenium WebDriver API
//   },
// });
