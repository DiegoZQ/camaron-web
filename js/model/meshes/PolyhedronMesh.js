"use strict";

// requires "./CPUModel";


class PolyhedronMesh extends PolygonMesh {
   constructor() {
      super();
      this.modelType = 'PolyhedronMesh';
      this.polyhedrons = [];
   }
}