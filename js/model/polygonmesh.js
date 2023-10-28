"use strict";

import Model from "./model";


class PolygonMesh extends Model {
   constructor(polygonsCount, verticesCount) {
      super();
      this.modelType = 'PolygonMesh';
      this.polygons = new Array(polygonsCount);
      this.vertices = new Array(verticesCount);
   }
  
   getPolygons() {
      return this.polygons;
   }
  
   getVertices() {
      return this.vertices;
   }
  }

export default PolygonMesh;