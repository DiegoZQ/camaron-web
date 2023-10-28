"use strict";

import CPUModel from "./CPUModel";


class PolygonMesh extends CPUModel {
   constructor(polygonsCount, verticesCount) {
      super();
      this.modelType = 'PolygonMesh';
      this.polygons = new Array(polygonsCount);
      this.vertices = new Array(verticesCount);
   }
}

export default PolygonMesh;