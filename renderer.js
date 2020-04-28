const fs = require("fs");
const path = require("path");

let filePath = [];

let editor = ace.edit("file-content");
editor.setTheme("ace/theme/dracula");
editor.session.setMode("ace/mode/text");
editor.$blockScrolling = Infinity;

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();

  for (const f of e.dataTransfer.files) {

    const fileName = path.parse(f.path).base;

    document.getElementById("file-name").innerHTML = fileName;

    if (filePath.length == 0) {
      filePath.push(f.path);
      appendToSideNav(fileName);
    } else {
      let isSameFile = false;
      for (let i = 0; i < filePath.length; i++) {
        if (filePath[i] == f.path) {
          isSameFile = true;
        }
      }
      if (!isSameFile) {
        filePath.push(f.path);
        appendToSideNav(fileName);
      }
    }

    // Asynchronous read
    fs.readFile(f.path, function (err, data) {
      if (err) {
        return console.error(err);
      }

      // set current synatax highlighting 
      setCurrentMode(fileName);

      // clean the editor and add drag content to it
      editor.setValue("");
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
  li.style.setProperty("cursor", "pointer");
  li.setAttribute("id", fileName);
  li.setAttribute("onmouseover", "this.className='hover'");
  li.setAttribute("onmouseout", "this.className=''");
  li.addEventListener('click', event => {
    for (let i = 0; i < filePath.length; i++) {

      const currentFileName = path.parse(filePath[i]).base;

      document.getElementById(currentFileName).style.setProperty("background-color", "#21252B");

      if (fileName == currentFileName) {
        // Asynchronous read
        fs.readFile(filePath[i], function (err, data) {
          if (err) {
            return console.error(err);
          }

          document.getElementById(fileName).style.setProperty("background-color", "#2C313A");


          // set current synatax highlighting 
          setCurrentMode(fileName);

          document.getElementById("file-name").innerHTML = fileName;
          editor.setValue("");
          editor.insert(data.toString());

        });
      }
    }
  });
  ul.appendChild(li);
}

function setCurrentMode(fileName) {
  let currentMode = path.extname(fileName);

  switch (currentMode) {
    case ".html":
      editor.session.setMode("ace/mode/html");
      break;
    case ".css":
      editor.session.setMode("ace/mode/css");
      break;
    case ".js":
      editor.session.setMode("ace/mode/javascript");
      break;
    default:
      editor.session.setMode("ace/mode/text");
  }
}