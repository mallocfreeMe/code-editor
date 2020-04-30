let fs = require("fs");
const path = require("path");

let filePath = [];

let editor = ace.edit("file-content");
editor.setTheme("ace/theme/dracula");
editor.session.setMode("ace/mode/text");
editor.$blockScrolling = Infinity;
editor.setShowPrintMargin(false);
editor.container.style.lineHeight = 1.5;
editor.renderer.updateFontSize();

editor.setOptions({
  selectionStyle: 'line',// "line"|"text"
  highlightActiveLine: false, // boolean
  highlightGutterLine: false, // boolean
  highlightSelectedWord: true, // boolean
  readOnly: false, // boolean: true if read only
  cursorStyle: 'ace', // "ace"|"slim"|"smooth"|"wide"
  mergeUndoDeltas: true, // false|true|"always"
  behavioursEnabled: true, // boolean: true if enable custom behaviours
  wrapBehavioursEnabled: true, // boolean
  autoScrollEditorIntoView: undefined, // boolean: this is needed if editor is inside scrollable page
});


// read file
document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();

  for (const f of e.dataTransfer.files) {

    // detect whether the drop item is a file or a folder
    if (!fs.lstatSync(f.path).isDirectory()) {
      const fileName = path.parse(f.path).base;

      document.getElementById("file-name").innerHTML = fileName;

      if (filePath.length == 0) {
        filePath.push(f.path);
        appendToSideNav(fileName);

        document.getElementById(fileName).style.setProperty("background-color", "#2C313A");
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

        for (let i = 0; i < filePath.length; i++) {
          let currentFile = document.getElementById(path.parse(filePath[i]).base);
          currentFile.style.setProperty("background-color", "#21252B");
        }

        document.getElementById(fileName).style.setProperty("background-color", "#2C313A");
      }

      // synchronous read
      const data = fs.readFileSync(f.path);

      // set current synatax highlighting 
      setCurrentMode(fileName);

      // clean the editor and add drag content to it
      editor.setValue("");
      editor.insert(data.toString());
      editor.gotoLine(1, 0);
      const row = 1;
      const col = 0;
      document.getElementById("cursor-pos").innerHTML = "Ln " + row + ", " + "Col " + col;
    } else {
      fs.readdirSync(f.path).forEach(fileName => {
        // check similar folder path

        // append to side-nav
        
        filePath.push(f.path + "/" + fileName);
        appendToSideNav(fileName);
      });
    }
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

// write file
editor.commands.addCommand({
  name: 'replace',
  bindKey: { win: 'Ctrl-s', mac: 'Command-S' },
  exec: function (editor) {
    for (let i = 0; i < filePath.length; i++) {
      if (document.getElementById(path.parse(filePath[i]).base).style.getPropertyValue("background-color") == "rgb(44, 49, 58)") {
        fs.writeFileSync(filePath[i], editor.getValue(), 'utf-8');
        break;
      }
    }
  },
  readOnly: false
});

// display col and row in footer
editor.on("click", function () {
  const cursorPos = editor.getCursorPosition();
  const row = (cursorPos.row + 1).toString();
  const col = cursorPos.column.toString();
  document.getElementById("cursor-pos").innerHTML = "Ln " + row + ", " + "Col " + col;
})

// append files to the side nav
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
        // synchronous read
        const data = fs.readFileSync(filePath[i]);

        document.getElementById(fileName).style.setProperty("background-color", "#2C313A");


        // set current synatax highlighting 
        setCurrentMode(fileName);

        document.getElementById("file-name").innerHTML = fileName;
        editor.setValue("");
        editor.insert(data.toString());
        editor.gotoLine(1, 0);
        const row = 1;
        const col = 0;
        document.getElementById("cursor-pos").innerHTML = "Ln " + row + ", " + "Col " + col;
      }
    }
  });
  ul.appendChild(li);
}

// detect current file syntax
function setCurrentMode(fileName) {
  let currentMode = path.extname(fileName);

  switch (currentMode) {
    case ".html":
      editor.session.setMode("ace/mode/html");
      document.getElementById("file-format").innerHTML = "HTML";
      break;
    case ".css":
      editor.session.setMode("ace/mode/css");
      document.getElementById("file-format").innerHTML = "CSS";
      break;
    case ".js":
      editor.session.setMode("ace/mode/javascript");
      document.getElementById("file-format").innerHTML = "JavaScript";
      break;
    default:
      editor.session.setMode("ace/mode/text");
      document.getElementById("file-format").innerHTML = "Plain Text";
  }
}