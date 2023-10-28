"use strict";


class ModelLoadStrategy {
   constructor(fileArray) {
      this.fileArray = normalizeFileArray(fileArray);
      this.isValid = true;
      this.CPUModel = null;
   }

   normalizeFileArray(fileArray) {
      return fileArray.map(line => line.trim()).filter(line => line && !line.startsWith('#'));
   }

   load() {
      return 1;
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