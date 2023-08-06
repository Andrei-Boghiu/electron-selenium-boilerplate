const link = document.querySelector("#link");
const searchQuery = document.querySelector("#search-query");
const test = document.querySelector("#test");
const startBtn = document.querySelector("#start");
const loginBox = document.querySelector("#login");
const dashboard = document.querySelector("#dashboard");
const logs = document.querySelector("#logs");

// default values
link.value =
  localStorage.getItem("last-used-link") ?? "https://www.google.com/";

searchQuery.value =
  localStorage.getItem("last-used-query") ?? "Get rich quick schemes";

function getValues() {
  let searchQueryValue = searchQuery.value;
  let linkVale = link.value;
  let testValue = test.value;

  return { searchQueryValue, linkVale, testValue };
}

document
  .querySelector("#modalContainer button#ok")
  .addEventListener("click", () => {
    const modalContainer = document.getElementById("modalContainer");
    modalContainer.style.display = "none";
  });

startBtn.addEventListener("click", () => {
  if (link.value && searchQuery.value && test.value) {
    const values = getValues();
    console.log(values);

    localStorage.setItem("last-used-query", values.searchQueryValue);

    // send data in main.js and main.js will send it in preload.js
    contextBridgeIpcRenderer.ipcRenderer.send(
      "start-selenium-automation",
      values
    );

    loginBox.setAttribute("hidden", "");
    dashboard.removeAttribute("hidden");
  } else {
    const modalContainer = document.querySelector("#modalContainer");
    modalContainer.querySelector("h2").innerText = "Warning";
    modalContainer.querySelector("p").innerText =
      "Please fill in all needed information before starting";
    modalContainer.style.display = "flex";
  }
});

contextBridgeIpcRenderer.ipcRenderer.on("info-for-logs", (e, data) => {
  console.log("info-for-logs received in renderer app");
  const newLog = document.createElement("p");
  newLog.textContent = data;

  logs.appendChild(newLog);
});
