// Selectors
const loginContainer = document.querySelector(".login-container");
const dashboardContainer = document.querySelector(".dashboard-container");
const modalContainer = document.querySelector(".modal-container");
const loadingContainer = document.querySelector(".loading-container");
const logsContainer = document.querySelector(".log-container");

// buttons
const startAutomation = document.querySelector("#start-automation");
const stopAutomation = document.querySelector("#stop-automation");
const form = document.querySelector("form#login");

// user inputs
const user = document.querySelector("#username");
const link = document.querySelector("#url");
const query = document.querySelector("#search-query");

// set last used inputs
user.value = localStorage.getItem("last-used-username") ?? "";
link.value = localStorage.getItem("last-used-url") ?? "";
query.value = localStorage.getItem("last-used-searchQuery") ?? "";

// Prevent default event to handle it with the click event
form.addEventListener("submit", (e) => {
  e.preventDefault();
});

startAutomation.addEventListener("click", () => {
  if (form.checkValidity()) {
    // get values
    const username = user.value;
    const url = link.value;
    const searchQuery = query.value;
    const values = { username, url, searchQuery };

    // set new values to be remembered for next time
    localStorage.setItem("last-used-username", username);
    localStorage.setItem("last-used-url", url);
    localStorage.setItem("last-used-searchQuery", searchQuery);

    // show loading screen
    loginContainer.style.display = "none"; // flex by default
    loadingContainer.style.display = "block";

    // send message to start automation (app.js -> main.js -> preload.js)
    contextBridgeIpcRenderer.ipcRenderer.send(
      "start-selenium-automation-to-main",
      values
    );

    // wait for a success response and show the dashboard (app.js <- main.js <- preload.js)
    contextBridgeIpcRenderer.ipcRenderer.on(
      "start-selenium-automation-success-to-renderer",
      (e, data) => {
        loadingContainer.style.display = "none";
        dashboardContainer.style.display = "block";
      }
    );
  }
});

stopAutomation.addEventListener("click", () => {
  // show loading screen
  dashboardContainer.style.display = "none";
  loadingContainer.style.display = "block";

  // send command to stop
  contextBridgeIpcRenderer.ipcRenderer.send(
    "stop-selenium-automation-to-main",
    "stop"
  );

  // show login when confirmation positive
  contextBridgeIpcRenderer.ipcRenderer.on(
    "stop-selenium-automation-to-renderer",
    (e, data) => {
      setTimeout(() => {
        loadingContainer.style.display = "none";
        loginContainer.style.display = "flex";
      }, 700);
    }
  );
});

// Receive logs from preload
contextBridgeIpcRenderer.ipcRenderer.on(
  "info-for-logs-to-renderer",
  (e, data) => {
    const newLog = document.createElement("div");
    newLog.classList = `log-entry ${data.logType}`;
    newLog.textContent = data.info;
    logsContainer.appendChild(newLog);
    // to also send a notification if logType === failure
  }
);

// Forgot password click handler
document.querySelector("#forgot-password").addEventListener("click", () => {
  modalContainer.querySelector("h2").innerText = "Don't worry";
  modalContainer.querySelector("p").innerText =
    "Just stay calm and try to remember your password";
  modalContainer.style.display = "flex";
  loginContainer.style.display = "none";

  document.querySelector("#modal-btn").addEventListener("click", () => {
    modalContainer.style.display = "none";
    loginContainer.style.display = "flex";
  });
});
