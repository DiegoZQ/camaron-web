"use strict";

// requires "../helpers";


class ModelLoadStrategy {
   constructor(fileArray) {
      this.fileArray = this.normalizeFileArray(fileArray);
      this.isValid = true;
      this.cpuModel = null;
   }

   normalizeFileArray(fileArray) {
      const normalizedFileArray = [];
      for (let i = 0; i < fileArray.length; i++) {
         const line = fileArray[i].trim();
         if (!line || line.startsWith('#')) continue;
         let lineBeforeHash = line.split('#')[0];
         normalizedFileArray.push(lineBeforeHash);
      }
      return normalizedFileArray;
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
         this.cpuModel.vertices = new Array(...Object.values(this.cpuModel.vertices));
         if (this.cpuModel.modelType === 'PSLG') {
            this.cpuModel.edges = new Array(...Object.values(this.cpuModel.edges));
            this.cpuModel.holes = new Array(...Object.values(this.cpuModel.holes));
         }
      } catch (error) {
         this.isValid = false;
         this.cpuModel = null;
         console.log(error);
      }
      return this.cpuModel;
   }

   // Carga todos los vértices del modelo partiendo por una cantidad de vértices a leer y un índice de inicio.
   _loadModelVertices(numVertices, startIndex, vertexIndices=false) {
      if (startIndex + numVertices > this.fileArray.length) {
         throw new Error('vertexCountError');
      }
      const bounds = new Float32Array(6);
      //const vertices = new Array(numVertices);
      const vertices = {};
      for (let i = 0; i < numVertices; i++) {
         const line = this.fileArray[startIndex + i];
         const lineWords = getLineWords(line);
         let x, y, z;

         if (vertexIndices) {
            if (lineWords.length != 4)
               throw new Error('VertexDimensionError');
            const [index, _x, _y, _z] = lineWords.map(parseFloat);
            x = _x;
            y = _y;
            z = _z;
            vertices[parseInt(index)] = new Vertex(parseInt(index), x, y, z);
         } else {
            if (lineWords.length != 3)
               throw new Error('VertexDimensionError');
            const [_x, _y, _z] = lineWords.map(parseFloat);
            x = _x;
            y = _y;
            z = _z;
            vertices[i] = new Vertex(i + 1, x, y, z);
         }

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
      //this.cpuModel.vertices = new Array(...Object.values(vertices));
      this.cpuModel.vertices = vertices;
      this.cpuModel.bounds = bounds;
      return startIndex + numVertices;
   }

   // Carga todos los lados del modelo partiendo por una cantidad de lados a leer y un índice de inicio.


   // Carga todos los polígonos del modelo partiendo por una cantidad de vértices a leer y un índice de inicio.
   _loadModelPolygons(numPolygons, startIndex, polygonIndices=null) {
      if (startIndex + numPolygons > this.fileArray.length) {
         throw new Error('polygonCountError');
      }
      const polygons = new Array(numPolygons);
      for (let i = 0; i < numPolygons; i++) {
         const line = polygonIndices ? this.fileArray[polygonIndices[i]] : this.fileArray[startIndex + i];
         const lineWords = getLineWords(line);
         const sidesCount = parseInt(lineWords[0]);
         if (lineWords.length < sidesCount + 1 || lineWords.length > sidesCount + 1 + 3) {
            throw new Error('polygonSideCountError');
         }
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
      return polygonIndices ? polygonIndices[polygonIndices.length-1] + 1 : startIndex + numPolygons;
   }
}