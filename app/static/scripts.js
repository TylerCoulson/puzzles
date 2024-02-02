import { WORDS } from "./words.js";


let currentDate = new Date();
let currMonth = currentDate.getMonth()+1;
let strDate = `${currentDate.getFullYear()}-${('0'+currMonth).slice(-2)}-${('0'+currentDate.getDate()).slice(-2)}`;

let words = WORDS[strDate];

const MAX_LENGTH = 10;
const BOARD_SIZE = 7;
let minLengths = Array(BOARD_SIZE).fill(0);
let currentLength = 0;

let activeRow = null;
let activeRowID = 1;
let belowRow = parseInt(localStorage.getItem("belowRow"));
let aboveRow = parseFloat(localStorage.getItem("aboveRow"));
let won = parseFloat(localStorage.getItem("won"));
let currRow = belowRow;
let winInput = document.getElementById("winCheckbox")



function buildBox() {
    let box = document.createElement("div");
    box.className = "flex items-center w-full h-full justify-center text-[2em] font-bold border-2 border-primary peer-checked:border-[oklch(var(--s))] peer-checked:group-[]:border-[oklch(var(--a))]";
    return box; 
};

function buildRow() {
    let row = document.createElement("div");
    row.className = "contents";
    
    let input = document.createElement("input");
    input.className = "hidden peer";
    input.setAttribute('type', 'radio');
    input.setAttribute('name', "row");
    row.appendChild(input)

    for (let r = 0; r < MAX_LENGTH; r++ ) {
        let box = buildBox();
        row.appendChild(box);
    }
    let btn = document.createElement("button");
    btn.className = "flex invisible w-10/12 justify-self-center h-10/12 btn btn-primary peer-checked:visible";
    btn.setAttribute('name', "add-letter");
    btn.textContent = "+"
    // row.appendChild(btn)
    
    return row; 
};

function buildBoard() {
    let board = document.getElementById("game-board")

    for (let r =0; r < BOARD_SIZE; r++ ) {
        let row = buildRow();
        board.appendChild(row);
    }
};
function initGame() {
    if (localStorage.getItem("date") != strDate) {
        belowRow = 1;
        aboveRow = (BOARD_SIZE-2);
        localStorage.setItem('belowRow', belowRow);
        localStorage.setItem('aboveRow', aboveRow);
        localStorage.setItem('date', strDate);
        localStorage.setItem('won', false);
    }

    winInput.checked = false;

    if (won) {
        winInput.checked = true;
    }

    buildBoard()

    for (let r=0; r<BOARD_SIZE; r++){
        let row = document.querySelectorAll("input[name='row']")[r].parentElement.getElementsByTagName('div');
        let word = words[r]
        if (r < belowRow || r > aboveRow) {
            for (let i = 0; i < word.length; i++) {
                row[i].textContent = word[i];
              } 
        }
    }

    selectRow(true);
    
    if (belowRow > aboveRow) {
        winGame();
    }
};

function winGame() {
    console.log("YOU WIN");
    winInput.checked = true;
    localStorage.setItem("won", true);
    activeRow = null;
    let row = document.querySelector('input[name="row"]:checked');
    if (row) {
        row.checked = false;
    }
};

function insertLetter(key) {
    if (currentLength == MAX_LENGTH) {
        return;
    }

    let pressedKey = key.toUpperCase();
    let box = activeRow.getElementsByTagName('div')[currentLength];
    box.textContent = pressedKey
    currentLength += 1;
};

function addLetter() {
    if (belowRow > aboveRow) {
        return;
    }
    deleteAllLetters();
    let word = words[activeRowID];
    if (minLengths[activeRowID] == word.length - 1){
        console.log("FINAL LETTER")
        document.activeElement.blur();
        return;
    }
    let key = word[minLengths[activeRowID]];
    let box = activeRow.getElementsByTagName('div')[currentLength];
    box.classList.add("text-error")

    document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
    minLengths[activeRowID] += 1;
    currentLength = minLengths[activeRowID];
    document.activeElement.blur();
};

function deleteAllLetters(){
    let l = currentLength;
    for (let i = 0; i < l; i++) {
        deleteLetter();
    } 
}

function checkGuess() {
    let guess = activeRow.textContent.replace(/\W/g, "")

    if (guess == words[activeRowID]) {
        console.log("correct guess");

        if (activeRowID === belowRow) {
            belowRow += 1;
            localStorage.setItem('belowRow', belowRow);
            selectRow(true);
        } else {
            aboveRow -= 1;
            localStorage.setItem('aboveRow', aboveRow);
            selectRow(false);
        }
        if (belowRow > aboveRow) {
            winGame();
        }
        return;

    } else {
        deleteAllLetters();
    }
};

function deleteLetter() {
    if (minLengths[activeRowID] >= currentLength) {
        return;
    }
    let box = activeRow.getElementsByTagName('div')[currentLength-1];
    box.textContent = ""
    currentLength -= 1;
};

function selectRow(below) {
    if (belowRow > aboveRow) {
        return;
    }
    if (below) {
        currRow = belowRow;
        document.getElementById("select-below");
    } else {
        currRow = aboveRow;
    }
    
    let row = document.querySelectorAll('input[name="row"]')[currRow];
    row.checked = true;
    activeRow = row.parentElement;
    activeRowID = currRow;
    currentLength = minLengths[activeRowID];
};

document.addEventListener("keyup", (e) => {
    if (belowRow > aboveRow) {
        return;
    }
    let pressedKey = e.key;

    if (pressedKey === "Backspace" && currentLength > 0) {
        deleteLetter();
        return;
      }
    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }
    if (/^[a-z]$/i.test(pressedKey)) {
        insertLetter(pressedKey);
        return;
    }
    else {
        return;
    }
});

document.getElementById("select-below").addEventListener("click", (e) => {selectRow(true)});
document.getElementById("select-above").addEventListener("click", (e) => {selectRow(false)});

let keys = document.querySelectorAll('button[name="key"]');
for (let i=0; i<keys.length; i++) {
    keys[i].addEventListener("click", (e) => {
        
        let key = e.target.textContent;
        
        if (key === "Del") {
            key = "Backspace";
        }
    
        document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
  });
};


initGame();

let addLetterList = document.querySelectorAll('button[name="add-letter"]')
for (let i=0; i<addLetterList.length; i++){
    addLetterList[i].addEventListener("click", addLetter);
};
