class DrawingCanvas {
    constructor() {
      this.isDrawing = false;
      this.points = [];
    }
  
    startDrawing() {
      this.isDrawing = true;
      this.canvas.addEventListener("mousemove", this.addPoint.bind(this));
    }
  
    stopDrawing() {
      this.isDrawing = false;
      this.canvas.removeEventListener("mousemove", this.addPoint.bind(this));
    }
  
    addPoint(event) {
      if (!this.isDrawing) return;
      let rect = this.canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      this.points.push({ x: x, y: y });
      this.redraw();
    }
  
    clearCanvas() {
      this.points = [];
      this.redraw();
    }
  
    undo() {
      this.points.pop();
      this.redraw();
    }
  
    redraw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
      this.ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        this.ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      this.ctx.stroke();
    }
  }