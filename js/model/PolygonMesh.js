"use strict";

// requires "./CPUModel";


class PolygonMesh extends CPUModel {
   constructor(polygonsCount, verticesCount) {
      super();
      this.modelType = 'PolygonMesh';
      this.polygons = new Array(polygonsCount);
      this.vertices = new Array(verticesCount);
   }
}