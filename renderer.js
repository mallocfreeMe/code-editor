const fs = require("fs");
const path = require("path");

const TabGroup = require("electron-tabs");

let tabGroup = new TabGroup();

let editor = ace.edit("file-content");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();

  for (const f of e.dataTransfer.files) {
    console.log('File(s) you dragged here: ', f.path);

    const fileName = path.parse(f.path).base;

    let tab = tabGroup.addTab({
      title: fileName,
      src: "index.html",
      visible: true
    });

    document.getElementById("file-name").innerHTML = fileName;

    appendToSideNav(fileName);


    // Asynchronous read
    fs.readFile(f.path, function (err, data) {
      if (err) {
        return console.error(err);
      }
      console.log("Asynchronous read: " + data.toString());

      editor.insert(data.toString());

    });
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});


function appendToSideNav(fileName) {
  let ul = document.getElementById("side-nav");
  let li = document.createElement("li");
  li.appendChild(document.createTextNode(fileName));
  li.style.setProperty("list-style", "none");
  li.style.setProperty("padding-left", "30%");
  ul.appendChild(li);
}

function createBrowserWindow() {
  const remote = require('electron').remote;
  const BrowserWindow = remote.BrowserWindow;
  const win = new BrowserWindow({
    height: 1000,
    width: 800
  });

  win.loadURL('<url>');
}