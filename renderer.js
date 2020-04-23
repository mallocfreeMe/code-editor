const fs = require("fs");
const path = require("path");

let editor = ace.edit("file-content");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();

  for (const f of e.dataTransfer.files) {
    console.log('File(s) you dragged here: ', f.path);

    document.getElementById("file-name").innerHTML = path.parse(f.path).base;

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