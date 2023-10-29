"use strict";

import { vec3, mat4, quat } from "../external/gl-matrix";


class Rotator {
   constructor() {
      this.width = gl.canvas.clientWidth;
      this.height = gl.canvas.clientHeight;
      this.r = Math.min(this.width, this.height)/2;
      this.q = quat.create();
      this.start = null;
   }

   getTrackBallVector(winX, winY) {
      const x = (2.0 * winX - this.width) / this.width;
      const y = (this.height - 2.0 * winY) / this.height;
      const z = 0;

      const v = vec3.fromValues(x, y, z);
      const length = Math.min(vec3.length(v), 1.0);
      v[2] = Math.sqrt(1 - length * length);
      vec3.normalize(v, v);

      return v;
   }

   setRotationStart(win_x, win_y) {
      this.start = this.getTrackBallVector(win_x, win_y);
   }

   rotateTo(win_x, win_y) {
      const end = this.getTrackBallVector(win_x, win_y);
      const axis = vec3.create();
      vec3.cross(axis, end, this.start);
      vec3.normalize(axis, axis);

      const aux = vec3.create();
      vec3.subtract(aux, end, this.start);
      const dis = -2 * vec3.length(aux);

      const curRP = quat.create();
      quat.setAxisAngle(curRP, axis, dis);

      quat.multiply(this.q, curRP, this.q);
      this.start = end;
   }

   get rotationMatrix() {
      const temp = mat4.create();
      if (this.q == null) 
         return temp;
      mat4.fromQuat(temp, this.q);
      return temp;
   }

   rescale() {
      this.width = gl.canvas.clientWidth;
      this.height = gl.canvas.clientHeight;
      this.r = Math.min(this.width, this.height) / 2;
   }

   reset() {
      this.rescale();
      this.q = quat.create();
   }
}

export default Rotator;