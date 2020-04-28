let fs = require("fs");
const path = require("path");

let Mousetrap = require('mousetrap');

let filePath = [];

let editor = ace.edit("file-content");
editor.setTheme("ace/theme/dracula");
editor.session.setMode("ace/mode/text");
editor.$blockScrolling = Infinity;
editor.setShowPrintMargin(false);

editor.setOptions({
  // editor options
  selectionStyle: 'line',// "line"|"text"
  highlightActiveLine: false, // boolean
  highlightSelectedWord: true, // boolean
  readOnly: false, // boolean: true if read only
  cursorStyle: 'ace', // "ace"|"slim"|"smooth"|"wide"
  mergeUndoDeltas: true, // false|true|"always"
  behavioursEnabled: true, // boolean: true if enable custom behaviours
  wrapBehavioursEnabled: true, // boolean
  autoScrollEditorIntoView: undefined, // boolean: this is needed if editor is inside scrollable page
  keyboardHandler: null, // function: handle custom keyboard events
  
  // renderer options
  // animatedScroll: false, // boolean: true if scroll should be animated
  // displayIndentGuides: false, // boolean: true if the indent should be shown. See 'showInvisibles'
  // showInvisibles: false, // boolean -> displayIndentGuides: true if show the invisible tabs/spaces in indents
  // showPrintMargin: true, // boolean: true if show the vertical print margin
  // printMarginColumn: 80, // number: number of columns for vertical print margin
  // printMargin: undefined, // boolean | number: showPrintMargin | printMarginColumn
  // showGutter: true, // boolean: true if show line gutter
  // fadeFoldWidgets: false, // boolean: true if the fold lines should be faded
  // showFoldWidgets: true, // boolean: true if the fold lines should be shown ?
  // showLineNumbers: true,
  // highlightGutterLine: false, // boolean: true if the gutter line should be highlighted
  // hScrollBarAlwaysVisible: false, // boolean: true if the horizontal scroll bar should be shown regardless
  // vScrollBarAlwaysVisible: false, // boolean: true if the vertical scroll bar should be shown regardless
  // fontSize: 12, // number | string: set the font size to this many pixels
  // fontFamily: undefined, // string: set the font-family css value
  // maxLines: undefined, // number: set the maximum lines possible. This will make the editor height changes
  // minLines: undefined, // number: set the minimum lines possible. This will make the editor height changes
  // maxPixelHeight: 0, // number -> maxLines: set the maximum height in pixel, when 'maxLines' is defined. 
  // scrollPastEnd: 0, // number -> !maxLines: if positive, user can scroll pass the last line and go n * editorHeight more distance 
  // fixedWidthGutter: false, // boolean: true if the gutter should be fixed width
  // theme: 'ace/theme/textmate', // theme string from ace/theme or custom?
 
  // mouseHandler options
  // scrollSpeed: 2, // number: the scroll speed index
  // dragDelay: 0, // number: the drag delay before drag starts. it's 150ms for mac by default 
  // dragEnabled: true, // boolean: enable dragging
  // focusTimout: 0, // number: the focus delay before focus starts.
  // tooltipFollowsMouse: true, // boolean: true if the gutter tooltip should follow mouse

  // session options
  // firstLineNumber: 1, // number: the line number in first line
  // overwrite: false, // boolean
  // newLineMode: 'auto', // "auto" | "unix" | "windows"
  // useWorker: true, // boolean: true if use web worker for loading scripts
  // useSoftTabs: true, // boolean: true if we want to use spaces than tabs
  // tabSize: 4, // number
  // wrap: false, // boolean | string | number: true/'free' means wrap instead of horizontal scroll, false/'off' means horizontal scroll instead of wrap, and number means number of column before wrap. -1 means wrap at print margin
  // indentedSoftWrap: true, // boolean
  // foldStyle: 'markbegin', // enum: 'manual'/'markbegin'/'markbeginend'.
  // mode: 'ace/mode/text' // string: path to language mode 
});


// read file
document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();

  for (const f of e.dataTransfer.files) {

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
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

// write file
Mousetrap.bind("command+s", function () {
  try {
    for (let i = 0; i < filePath.length; i++) {
      if (document.getElementById(path.parse(filePath[i]).base).style.getPropertyValue("background-color") == "rgb(44, 49, 58)") {
        fs.writeFileSync(filePath[i], editor.getValue(), 'utf-8');
        break;
      }
    }
  }
  catch (e) {
    alert('Failed to save the file !' + e);
  }
});

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