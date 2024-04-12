"use strict";

// requires './Shape';
// requires '../external/gl-matrix'; 


class Hole extends Shape {
   // Crea un vértice a partir de un id entero positivo y 3 floats.
    constructor(id, x, y, z) {
        super(id);
        this.coords = vec3.fromValues(x, y, z);
    }
}