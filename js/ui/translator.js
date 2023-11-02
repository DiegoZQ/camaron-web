"use strict";

// requires "../external/gl-matrix";


class Translator {
   constructor() {
      this.width = gl.canvas.clientWidth;
      this.height = gl.canvas.clientHeight;
      this.startX = 0;
      this.startY = 0;
      this.endX = 0;
      this.endY = 0;
      this.movementVector = vec3.create();
   }

   setMovementStart(win_x, win_y) {
      this.startX = win_x;
      this.startY = win_y;
   }

   moveTo(win_x, win_y) {
      this.endX = win_x;
      this.endY = win_y;

      const dx = this.startX - this.endX;
      const dy = this.startY - this.endY;

      this.movementVector[0] += -dx;
      this.movementVector[1] += dy;

      this.startX = this.endX;
      this.startY = this.endY;
   }

   rescale() {
      this.width = gl.canvas.clientWidth;
      this.height = gl.canvas.clientHeight;
   }

   reset() {
      this.rescale();
      this.movementVector = vec3.create();
   }
}