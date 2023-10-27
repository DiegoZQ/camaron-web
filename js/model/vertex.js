"use strict";

import Element from './element';
import { vec3 } from '../external/gl-matrix'; 


class Vertex extends Element {
   // Crea un vértice a partir de un id entero positivo y 3 floats.
   constructor(id, x, y, z) {
      super(id);
      this.coords = vec3.fromValues(x, y, z);
      this.normal = null;
      this.polygons = [];
   }
  
   // Obtiene las coordenadas de un vértice.
   getCoords() {
      return this.coords;
   }

   // Calcula la normal de un vértice a partir de los polígonos que lo comprenden.
   calculateNormal() {
      this.normal = vec3.create();
      if (this.polygons.length > 0) {
         // para cada polígono que tiene el vértice, suma sus normales a la normal del vértice
         for (const polygon of this.polygons) 
            vec3.add(this.normal, this.normal, polygon.getNormal());
         // y normaliza con norma 1
         vec3.normalize(this.normal, this.normal);
      }
   }

  // Obtiene la normal de un vértice, y si no está guardada, la calcula.
   getNormal() {
      if (this.normal === null) 
         this.calculateNormal();
      return vec3.clone(this.normal);
   }
  
   // Obtiene todos los polígonos que comprenden un vértice.
   getPolygons() {
      return this.polygons;
   }
}

export default Vertex;