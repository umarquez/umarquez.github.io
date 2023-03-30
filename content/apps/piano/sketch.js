let whiteKeys = [];
let blackKeys = [];
let allKeys = {};
let audioContext = new AudioContext();
let gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

function setup() {
  createCanvas(windowWidth, windowHeight);
  let totalKeys = 36;
  let keyWidth = 70;
  let keyHeight = keyWidth*5;
  let octaveWidth = 7 * keyWidth;
  let startX = (displayWidth-(octaveWidth*3))/2;
  let startY = (windowHeight - keyHeight) / 2;
  
  let correction = 0;

  let chromaticScale = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  for (let i = 0; i < totalKeys; i++) {
    let noteName = chromaticScale[i % 12];
    let keyName = noteName + ((i % 12) + 3);
    let midiValue = i + 48;
    let keyX = startX + i * keyWidth - correction;
    let keyY = startY;
    let newKey;

    switch (noteName) {
      case "C":
      case "C#":
      case "D":
      case "D#":
      case "F":
      case "F#":
      case "G":
      case "G#":
      case "A":
      case "A#":
        correction += keyWidth / 2;
    }

    if (noteName.length == 1) {
      newKey = new PianoKey(
        keyName,
        midiValue,
        keyX,
        keyY,
        keyWidth,
        keyHeight,
        255
      );
      whiteKeys.push(newKey);
    } else {
      newKey = new PianoKey(
        keyName,
        midiValue,
        keyX + keyWidth / 2 - keyWidth * 0.3,
        keyY,
        keyWidth * 0.5,
        keyHeight * 0.65,
        0
      );
      blackKeys.push(newKey);
    }

    allKeys[midiValue] = newKey;
  }

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  } else {
    alert("Web MIDI not supported in this browser");
  }
}

function onMIDISuccess(midiAccess) {
  console.log("MIDI ready!");

  let inputs = midiAccess.inputs;
  inputs.forEach(function (input) {
    input.onmidimessage = onMIDIMessage;
  });
}

function onMIDIFailure(error) {
  console.warn("Failed to get MIDI access", error);
}

function onMIDIMessage(event) {
  let [command, note, velocity] = event.data;

  if (command === 144) {
    // noteOn
    let k = allKeys[note];
    if (k) {
      k.press(velocity);
    }
  } else if (command === 128) {
    // noteOff
    let k = allKeys[note];
    if (k) {
      k.release();
    }
  }
}

function draw() {
  background(220);
  for (let i = 0; i < whiteKeys.length; i++) {
    whiteKeys[i].display();
  }
  for (let i = 0; i < blackKeys.length; i++) {
    blackKeys[i].display();
  }
}

function mousePressed() {
  for (let i = 0; i < blackKeys.length; i++) {
    if (
      mouseX >= blackKeys[i].x &&
      mouseX <= blackKeys[i].x + blackKeys[i].w &&
      mouseY >= blackKeys[i].y &&
      mouseY <= blackKeys[i].y + blackKeys[i].h
    ) {
      blackKeys[i].press(64);
      return;
    }
  }

  for (let i = 0; i < whiteKeys.length; i++) {
    if (
      mouseX >= whiteKeys[i].x &&
      mouseX <= whiteKeys[i].x + whiteKeys[i].w &&
      mouseY >= whiteKeys[i].y &&
      mouseY <= whiteKeys[i].y + whiteKeys[i].h
    ) {
      whiteKeys[i].press(64);
      return;
    }
  }
}

function mouseReleased() {
  let keys = Object.keys(allKeys);
  for (let i = 0; i < keys.length; i++) {
    allKeys[keys[i]].release();
  }
}
