"use strict";


class PolyhedronMesh extends PolygonMesh {
   constructor() {
      super();
      this.modelType = 'PolyhedronMesh';
      this.polyhedrons = [];
   }
}