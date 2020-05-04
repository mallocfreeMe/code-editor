const fs = require("fs");
const path = require("path");
const glob = require("glob");

let filePath = [];
let firstTime = true;

let editor = ace.edit("file-content");
ace.require("ace/ext/language_tools");
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
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true
});


// read file
document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();

  for (const f of e.dataTransfer.files) {

    // detect whether the drop item is a file or a folder
    if (!fs.lstatSync(f.path).isDirectory()) {

      document.getElementById("file-name").innerHTML = path.parse(f.path).base;

      if (filePath.length == 0) {
        filePath.push(f.path);
        appendToSideNav(f.path);

        document.getElementById(f.path).style.setProperty("background-color", "#2C313A");
      } else {
        let isSameFile = false;
        for (let i = 0; i < filePath.length; i++) {
          if (filePath[i] == f.path) {
            isSameFile = true;
          }
        }
        if (!isSameFile) {
          filePath.push(f.path);
          appendToSideNav(f.path);
        }

        for (let i = 0; i < filePath.length; i++) {
          let currentFile = document.getElementById(path.parse(filePath[i]).base);
          currentFile.style.setProperty("background-color", "#21252B");
        }

        document.getElementById(f.path).style.setProperty("background-color", "#2C313A");
      }

      // synchronous read
      const data = fs.readFileSync(f.path);

      // set current synatax highlighting 
      setCurrentMode(f.path);

      // clean the editor and add drag content to it
      editor.setValue("");
      editor.insert(data.toString());
      editor.gotoLine(1, 0);
      const row = 1;
      const col = 0;
      document.getElementById("cursor-pos").innerHTML = "Ln " + row + ", " + "Col " + col;
    } else {

      let getDirectories = function (src, callback) {
        glob(src + '/**/*', callback);
      };
      getDirectories(f.path, function (err, res) {
        if (err) {
          console.log('Error', err);
        } else {

          filePath.push(f.path);
          appendToSideNav(f.path);

          fs.readdirSync(f.path).sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          }).filter(a => !a.includes(".DS_Store") && !a.includes(".git")).forEach(fileName => {
            filePath.push(f.path + "/" + fileName);
            appendToSideNav(f.path + "/" + fileName);
          });

          firstTime = false;
        }
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
// check if user click a folder or a file
// if its a file, then read the file and set current synatax highlighting 
// if its a folder, then open the folder, show all sub files
function appendToSideNav(fileAdress) {
  let ul = document.getElementById("side-nav");

  let li = document.createElement("li");
  li.appendChild(document.createTextNode(path.parse(fileAdress).base));
  li.style.setProperty("list-style", "none");
  li.style.setProperty("padding-left", "10%");
  li.style.setProperty("cursor", "pointer");
  li.style.setProperty("-webkit-touch-callout", "none");
  li.style.setProperty("-webkit-user-select", "none");
  li.style.setProperty("-khtml-user-select", "none");
  li.style.setProperty("-moz-user-select", "none");
  li.style.setProperty("-ms-user-select", "none");
  li.style.setProperty("user-select", "none");

  li.setAttribute("id", fileAdress);
  li.setAttribute("onmouseover", "this.className='hover'");
  li.setAttribute("onmouseout", "this.className=''");

  li.addEventListener('click', event => {
    for (let i = 0; i < filePath.length; i++) {

      // document.getElementById(path.parse(filePath[i]).base).style.setProperty("background-color", "#21252B");
      if (fileAdress == filePath[i]) {

        if (!fs.lstatSync(filePath[i]).isDirectory()) {

          const data = fs.readFileSync(filePath[i]);

          // document.getElementById(fileAdress).style.setProperty("background-color", "#2C313A");

          setCurrentMode(fileAdress);

          document.getElementById("file-name").innerHTML = path.parse(fileAdress).base;
          editor.setValue("");
          editor.insert(data.toString());
          editor.gotoLine(1, 0);
          const row = 1;
          const col = 0;
          document.getElementById("cursor-pos").innerHTML = "Ln " + row + ", " + "Col " + col;
        } else {
          let flag = true;

          filePath.filter(a => a.includes(filePath[i])).forEach(a => {
            if (a.split("/").length - 1 > filePath[i].split("/").length - 1) {
              flag = false;
            }
          });

          if (flag) {
            read(filePath[i]);
          } else {

            let flag2 = true;

            filePath.filter(a => a.includes(filePath[i])).filter(a => a.split("/")
              .length - 1 > filePath[i].split("/").length - 1)
              .forEach(a => {
                if (document.getElementById(a).style.getPropertyValue("display") == "block") {
                  flag2 = true;
                } else if (document.getElementById(a).style.getPropertyValue("display") == "none") {
                  flag2 = false;
                }
              });

            if (flag2) {
              filePath.filter(a => a.includes(filePath[i])).filter(a => a.split("/")
                .length - 1 > filePath[i].split("/").length - 1)
                .forEach(a => document.getElementById(a).style.setProperty("display", "none"));
            } else {
              filePath.filter(a => a.includes(filePath[i])).filter(a => a.split("/")
                .length - 1 > filePath[i].split("/").length - 1)
                .forEach(a => document.getElementById(a).style.setProperty("display", "block"));
            }
          }

        }
      }

    }
  });

  let list = ul.getElementsByTagName("li");

  if (firstTime) {
    ul.appendChild(li);
  } else {
    for (let i = 0; i < list.length; i++) {
      if (li.id.includes(list[i].id) && li.id.split("/").length - 1 == list[i].id.split("/").length - 1 + 1) {
        // let padding = (li.id.split("/").length - 1) * 5 + "%";
        // li.style.setProperty("padding-left", padding);
        list[i].after(li);
        break;
      }
    }
  }

}

// detect current file syntax
function setCurrentMode(filePath) {
  let currentMode = path.extname(path.parse(filePath).base);

  switch (currentMode) {
    case ".c":
      editor.session.setMode("ace/mode/c_cpp");
      document.getElementById("file-format").innerHTML = "C/C++";
      break;
    case ".cpp":
      editor.session.setMode("ace/mode/c_cpp");
      document.getElementById("file-format").innerHTML = "C/C++";
      break;
    case ".css":
      editor.session.setMode("ace/mode/css");
      document.getElementById("file-format").innerHTML = "CSS";
      break;
    case ".html":
      editor.session.setMode("ace/mode/html");
      document.getElementById("file-format").innerHTML = "HTML";
      break;
    case ".js":
      editor.session.setMode("ace/mode/javascript");
      document.getElementById("file-format").innerHTML = "JavaScript";
      break;
    case ".py":
      editor.session.setMode("ace/mode/python");
      document.getElementById("file-format").innerHTML = "Python";
      break;
    default:
      editor.session.setMode("ace/mode/text");
      document.getElementById("file-format").innerHTML = "Plain Text";
  }
}

// read folder
function read(path) {
  fs.readdirSync(path).sort(function (a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  }).filter(a => !a.includes(".DS_Store") && !a.includes(".git")).forEach(fileName => {
    filePath.push(path + "/" + fileName);
    appendToSideNav(path + "/" + fileName);
  });
}