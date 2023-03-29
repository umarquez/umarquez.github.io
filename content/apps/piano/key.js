function midiToFrequency(midiValue) {
  let frequency = 440 * Math.pow(2, (midiValue - 69) / 12);
  return frequency;
}

class PianoKey {
  constructor(name, midiValue, x, y, w, h, c) {
    this.name = name;
    this.midiValue = midiValue;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.isPressed = false;
    this.color = c;
  }

  press(vel) {
    this.isPressed = true;
    this.velocity = vel;
    this.playNote();
  }

  release() {
    this.isPressed = false;
    this.endNote();
  }

  display() {
    stroke(127);
    fill(this.isPressed ? color(255, 0, 0) : this.color);
    rect(this.x, this.y, this.w, this.h);
    // textAlign(CENTER, CENTER);
    // textSize(16);
    // textStyle();
    // fill(this.isPressed ? 0 : color(128, 128, 255));
    // text(this.midiValue, this.x + this.w / 2, this.y + this.h * 0.7);
  }

  endNote() {
    if(this.gainNode){
      this.gainNode.gain.cancelAndHoldAtTime(audioContext.currentTime);
      let releaseTime = audioContext.currentTime + 0.2;
      this.gainNode.gain.linearRampToValueAtTime(0.0001, releaseTime); // release
      this.oscillatorNode.stop(audioContext.currentTime + 0.5);
      this.gainNode.addEventListener("ended", () => {
        this.gainNode.disconnect(audioContext.destination);
      });
    }
  }

  playNote(time = audioContext.currentTime) {
    let frequency = midiToFrequency(this.midiValue);
    let duration = time - audioContext.currentTime;

    // Crear un nodo OscillatorNode con la frecuencia de la nota.
    let oscillatorNode = audioContext.createOscillator();
    oscillatorNode.frequency.setValueAtTime(
      frequency,
      audioContext.currentTime
    );
    oscillatorNode.type = "triangle";

    // Crear un nodo GainNode para controlar la amplitud de la señal de audio.
    let gain = this.velocity / 127.0;
    gain = (gain > 0.5)?0.5:gain
    let gainNode = audioContext.createGain();
    this.gainNode = gainNode;
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);

    // Conectar el nodo OscillatorNode al nodo GainNode y el nodo GainNode al destino de audio.
    oscillatorNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Iniciar el nodo OscillatorNode y cambiar el valor de ganancia del nodo GainNode.
    oscillatorNode.start();
    gainNode.gain.exponentialRampToValueAtTime(gain, audioContext.currentTime + 0.1); // ataque
    gainNode.gain.exponentialRampToValueAtTime(
      gain * 0.5,
      audioContext.currentTime + 0.2
    ); // sustain

    // Asignar el nodo OscillatorNode y el nodo GainNode a la nota para poder detenerlos más tarde.
    this.oscillatorNode = oscillatorNode;
  }
}
