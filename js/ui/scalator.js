"use strict";


class Scalator {
   constructor() {
      this.width = gl.canvas.clientWidth;
      this.height = gl.canvas.clientHeight;
      this.scaleFactor = 1;
   }

   scale(df) {
      this.scaleFactor += df;
      if (this.scaleFactor < 0)
         this.scaleFactor = 0;
   }

   rescale() {
      this.width = gl.canvas.clientWidth;
      this.height = gl.canvas.clientHeight;
   }

   reset() {
      this.rescale();
      this.scaleFactor = 1;
   }
}

export default Scalator;