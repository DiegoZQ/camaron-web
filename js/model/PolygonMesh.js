"use strict";

import Model from "./Model";


class PolygonMesh extends Model {
   constructor(polygonsCount, verticesCount) {
      super();
      this.modelType = 'PolygonMesh';
      this.polygons = new Array(polygonsCount);
      this.vertices = new Array(verticesCount);
   }
}

export default PolygonMesh;