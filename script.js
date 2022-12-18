const EMPTY = " "; // NBSP

var FADE_TIME = 1000;
var TIMEOUT_TIME = 60*1000;
var TIMEOUT_WARN_TIME = 30*1000;
var COLOR_CYCLE_TIME = 30*1000;
var LOOP_INT = 0;

var body = document.getElementById("body");
var fadeText = document.getElementById("fadetext");
var entry = document.getElementById("entrytext");

var fadeStart = 0;
var typeStart = null;
var lastPress = Date.now();
var timeoutFading = false;

var hintHidden = false;

// Using zero-width whitespace as empty string so caret can be centered
// Does require string compare to check for empty though...
function isEmpty() {
	return entry.innerText == EMPTY;
}

function clear() {
	entry.innerText = EMPTY;
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
	if (entry.innerText.length == 0) {
		clear(); // Maintain whitespace
	}
	if (isEmpty()) {
		typeStart = new Date();
	}
	else if (event.key == "Enter") {
		event.preventDefault();
		let written = entry.innerText;
		
        record(entry.innerText, typeStart, new Date(), false);
		
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
			record(entry.innerText, typeStart, new Date(lastPress), true);
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

function record(x, start, end, unended) {
	// Placeholder
	console.log(x);
	console.log(start, end, unended, end-start);
}

setInterval(loop, 0);

entry.focus();