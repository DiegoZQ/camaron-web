"use strict";


class ModelLoadStrategy {
   constructor(fileArray) {
      this.fileArray = this.normalizeFileArray(fileArray);
      this.isValid = true;
      this.cpuModel = null;
   }

   normalizeFileArray(fileArray) {
      return fileArray.map(line => line.trim()).filter(line => line && !line.startsWith('#'));
   }

   calculateVertexNormals(polygonMesh) {
      const vertices = polygonMesh.getVertices();
      for (const vertex of vertices) 
         vertex.calculateNormal();
   }

   completeMesh(polygonMesh) {
      // this.calculateVertexNormals(polygonMesh);
   }

   _load(fun) {
      try {
         fun();
      } catch (error) {
         this.isValid = false;
         this.cpuModel = null;
         console.log(error);
      }
      return this.cpuModel;
   }

   // Carga todos los vértices del modelo partiendo por un índice de inicio y una cantidad de vértices a leer.
   _loadModelVertices(startIndex, numVertices) {
      if (startIndex + numVertices > this.fileArray.length) {
         throw new Error('vertexCountError');
      }
      const bounds = new Float32Array(6);
      const vertices = new Array(numVertices);
      for (let i = 0; i < numVertices; i++) {
         const line = this.fileArray[startIndex + i];
         const lineWords = getLineWords(line);
         if (lineWords.length != 3) 
            throw new Error('VertexDimensionError');

         const [x, y, z] = lineWords.map(parseFloat);
         vertices[i] = new Vertex(i + 1, x, y, z);

         if (bounds.every(value => value === 0)) 
            bounds.set([x, y, z, x, y, z]);       
         else {
            bounds[0] = Math.min(bounds[0], x);
            bounds[1] = Math.min(bounds[1], y);
            bounds[2] = Math.min(bounds[2], z);
            bounds[3] = Math.max(bounds[3], x);
            bounds[4] = Math.max(bounds[4], y);
            bounds[5] = Math.max(bounds[5], z);
         }
      }
      this.cpuModel.vertices = vertices;
      this.cpuModel.bounds = bounds;
      return startIndex + numVertices;
   }

   // Carga todos los polígonos del modelo partiendo por un índice de inicio y una cantidad de vértices a leer.
   _loadModelPolygons(startIndex, numPolygons) {
      if (startIndex + numPolygons > this.fileArray.length) {
         throw new Error('polygonCountError');
      }
      const polygons = new Array(numPolygons);
      for (let i = 0; i < numPolygons; i++) {
         const line = this.fileArray[startIndex + i];
         const lineWords = getLineWords(line);
         const sidesCount = parseInt(lineWords[0]);
         if (lineWords.length !== sidesCount + 1) 
         	throw new Error('polygonSideCountError');

         const polygon = new Polygon(i+1);
         // para cada índice de vértice
         for(let j = 1; j <= sidesCount; j++) {
            const vertexIndex = parseInt(lineWords[j]);
            const vertex = this.cpuModel.vertices[vertexIndex];

            // agrega cada vértice a los vértices del polígono
            polygon.vertices.push(vertex);
            // y agrega el nuevo polígono como parte de los polígonos de cada vértice
            vertex.polygons.push(polygon);
         }
         polygons[i] = polygon;
      }
      this.cpuModel.polygons = polygons;
      return startIndex + numPolygons;
   }
}