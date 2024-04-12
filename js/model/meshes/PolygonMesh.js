"use strict";

// requires "./CPUModel";


class PolygonMesh extends VertexCloud {
   constructor() {
      super();
      this.modelType = 'PolygonMesh';
      this.polygons = null;
   }
}