"use strict";

// requires "./CPUModel";


class PolygonMesh extends CPUModel {
   constructor() {
      super();
      this.modelType = 'PolygonMesh';
      this.vertices = null;
      this.polygons = null;
   }
}