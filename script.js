var FADE_TIME = 1000;
var TIMEOUT_TIME = 60*1000;
var TIMEOUT_WARN_TIME = 30*1000;
var COLOR_CYCLE_TIME = 30*1000;

var body = document.getElementById("body");
var fadeText = document.getElementById("fadetext");
var entry = document.getElementById("entrytext");
var recordTable = document.getElementById("recordTable");

var fadeStart = 0;
var typeStart = null;
var lastPress = Date.now();
var timeoutFading = false;

var hintHidden = false;

function isEmpty() {
	return entry.innerText == "\n";
}

function clear() {
	entry.innerText = "\n";
}

// Could change to change text color
function textColor(a) {
	return "rgba(0, 0, 0, " + a + ")";
}

function backgroundColor(t) {
	let h = (t%COLOR_CYCLE_TIME)/COLOR_CYCLE_TIME*360;
	return "hsl(" + h + ", 80%, 90%)";
}

function keyPress(event) {
	lastPress = Date.now();
	if (!hintHidden) {
		hintHidden = true;
		document.getElementById('hint').hidden = true;
	}
	if (timeoutFading) {
		entry.style.color = "black";
		timeoutFading = false;
	}
	if (isEmpty()) {
		typeStart = Date.now();
		if (event.key == "Enter") {
			event.preventDefault();
		}
	}
	else if (event.key == "Enter") {
		event.preventDefault();
		let written = entry.innerText.trim();
		
        record(written, typeStart, Date.now(), false);
		
		fadeText.innerText = written;
		fadeText.style.color = textColor(1);
		clear();
		fadeStart = Date.now();
    }
}

/* NOTE: Currently have it set up as continuously running loop.
If background can be drawn with CSS animation, loop could only be activated when something is fading.
This seems to give more flexibility though. */
function loop() {
	// Fading text
	let t = Date.now() - fadeStart;
	let a = 1-t/FADE_TIME;
	fadeText.style.color = textColor(a);
	
	// Entry timeout
	if (!isEmpty()) {
		let t2 = Date.now() - lastPress;
		if (t2 > TIMEOUT_TIME) {
			record(entry.innerText.trim(), typeStart, lastPress, true);
			entry.style.color = textColor(1);
			clear();
		}
		else if (t2 > TIMEOUT_WARN_TIME) {
			let a2 = 1-(t2-TIMEOUT_WARN_TIME)/(TIMEOUT_TIME-TIMEOUT_WARN_TIME);
			entry.style.color = textColor(a2);
			timeoutFading = true;
		}
	}
	
	// Background color
	body.style.backgroundColor = backgroundColor(Date.now());
}

var records = [];
if (window.localStorage.getItem('records')) {
	records = JSON.parse(window.localStorage.getItem('records'));
	for (r of records) {
		toTable(r);
	}
}
else {
	save();
}


function save() {
	window.localStorage.setItem('records', JSON.stringify(records));
}

class Record {
	constructor (content, start, end, unended) {
		this.content = content;
		this.start = start;
		this.end = end;
		this.unended = unended;
	}
}

function toTable(r) {
	let tr = document.createElement("tr");
	let td1 = document.createElement("td");
	let td2 = document.createElement("td");
	td1.innerText = new Date(r.start).toLocaleString();
	td1.align = "right";
	td2.innerText = r.content;
	tr.appendChild(td1);
	tr.appendChild(td2);
	recordTable.appendChild(tr);
}

function record(content, start, end, unended) {
	let r = new Record(content, start, end, unended);
	records.push(r);
	console.log(records); // Debugging
	toTable(r);
	save();
}

setInterval(loop, 0);

entry.focus();