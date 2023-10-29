"use strict";

import Shape from './Shape';
import { vec3 } from '../external/gl-matrix'; 


class Vertex extends Shape {
   // Crea un vértice a partir de un id entero positivo y 3 floats.
   constructor(id, x, y, z) {
      super(id);
      this.coords = vec3.fromValues(x, y, z);
      this._normal = null;
      this.polygons = [];
   }
  
   // Calcula la normal de un vértice a partir de los polígonos que lo comprenden.
   calculateNormal() {
      this._normal = vec3.create();
      if (this.polygons.length > 0) {
         // para cada polígono que tiene el vértice, suma sus normales a la normal del vértice
         for (const polygon of this.polygons) 
            vec3.add(this._normal, this._normal, polygon.normal);
         // y normaliza con norma 1
         vec3.normalize(this._normal, this._normal);
      }
   }

  // Obtiene la normal de un vértice, y si no está guardada, la calcula.
   get normal() {
      if (this._normal == null) 
         this.calculateNormal();
      return vec3.clone(this._normal);
   }
}

export default Vertex;