const fs = require("fs");
const path = require("path");

let filePath = [];

let editor = ace.edit("file-content");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");
editor.$blockScrolling = Infinity;

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();

  for (const f of e.dataTransfer.files) {

    filePath.push(f.path);

    const fileName = path.parse(f.path).base;

    document.getElementById("file-name").innerHTML = fileName;

    appendToSideNav(fileName);

    // Asynchronous read
    fs.readFile(f.path, function (err, data) {
      if (err) {
        return console.error(err);
      }

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
  li.addEventListener('click', event => {
    for (let i = 0; i < filePath.length; i++) {
      if (fileName == path.parse(filePath[i]).base) {
        // Asynchronous read
        fs.readFile(filePath[i], function (err, data) {
          if (err) {
            return console.error(err);
          }

          // clean the editor and add drag content to it
          editor.setValue("");
          editor.insert(data.toString());

        });
      }
    }
  });
  ul.appendChild(li);
}