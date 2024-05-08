"use strict";

// requires './Shape';
// requires '../external/gl-matrix'; 


class Vertex extends Hole {
   // Crea un vértice a partir de un id entero positivo y 3 floats.
   constructor(id, x, y, z) {
      super(id, x, y, z);
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

   // Sea un plano definido por la ecuación ax + by + cz + d = 0, retorna True si el vértice está en el lado positivo del plano;
   // retorna false en otro caso.
   orientationInPlane(a, b, c, d) {
      const orientation = vec3.dot(this.coords, [a,b,c]) - d > 0; 
      return orientation;
   }
}