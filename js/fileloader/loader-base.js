"use strict";


class ModelLoadStrategy {
   constructor(fileArray) {
      this.fileArray = fileArray;
      this.valid = true;
      this.model = null;
   }

   getModel() {
      return this.model;
   }

   load() {
      return 1;
   }

   isValid() {
      return this.valid;
   }

   calculateVertexNormals(polygonMesh) {
      const vertices = polygonMesh.getVertices();
      for (const vertex of vertices) 
         vertex.calculateNormal();
   }

   completeMesh(polygonMesh) {
      // this.calculateVertexNormals(polygonMesh);
   }
}

export default ModelLoadStrategy;