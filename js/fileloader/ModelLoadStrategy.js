"use strict";

// requires "../helpers";


class ModelLoadStrategy {
   constructor(fileArray) {
      this.fileArray = this.normalizeFileArray(fileArray);
      this.isValid = null;
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

   load(fun) {
      try {
         fun();
         this.isValid = true;
      } catch (error) {
         this.isValid = false;
         this.cpuModel = null;
         console.log(error);
      }
      return this.cpuModel;
   }

   // Carga todos los vértices del modelo partiendo por una cantidad de vértices a leer y un índice de inicio.
   loadModelVertices(numVertices, startIndex, dimensions=3, vertexIndices=false) {
      if (startIndex + numVertices > this.fileArray.length) {
         throw new Error('vertexCountError');
      }
      if (![2, 3].includes(dimensions)) {
         throw new Error('vertex invalid dimensions');
     }

      const bounds = new Float32Array(6);
      const vertices = {};

      for (let i = 0; i < numVertices; i++) {
         const lineWords = getLineWords(this.fileArray[startIndex + i]);
         if ((vertexIndices && lineWords.length < dimensions + 1) || (!vertexIndices && lineWords.length < dimensions)) {
            throw new Error('VertexDimensionError');
         }

         let index, id, x, y, z = 0;
         if (vertexIndices) {
            index = parseInt(lineWords[0]);
            id = index;
            if (dimensions === 2) {
               [x, y] = lineWords.slice(1, dimensions + 1).map(parseFloat);
            } else {
               [x, y, z] = lineWords.slice(1, dimensions + 1).map(parseFloat);
            }
         } else {
            if (dimensions === 2) {
               [x, y] = lineWords.slice(0, dimensions).map(parseFloat);
            } else {
               [x, y, z] = lineWords.slice(0, dimensions).map(parseFloat);
            }
            index = i;
            id = index + 1;
         }
         vertices[index] = new Vertex(id, x, y, z);

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

   // Carga todos los polígonos del modelo partiendo por una cantidad de vértices a leer y un índice de inicio.
   loadModelPolygons(numPolygons, startIndex, polygonIndices=null) {
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

   _exportToOff() {
      const allowedTypes = ['VertexCloud', 'PolygonMesh'];
      if (allowedTypes.includes(this.cpuModel.modelType)) {
         this.cpuModel.vertices.sort((a, b) => a.id - b.id);
         const vertices = this.cpuModel.vertices;
         const polygons = this.cpuModel.polygons ? this.cpuModel.polygons : [];
         const minVertexid = vertices[0]?.id; 

         // OFF Header
         let content = `OFF\n${vertices.length} ${polygons.length} 0\n`;
         // Vertices
         for (const vertex of vertices) {
            content += `${vertex.coords.join(' ')}\n`;
         }
         // Polygons
         for (const polygon of polygons) {
            const vertexIndices = polygon.vertices.map(vertex => vertex.id - minVertexid);
            content += `${vertexIndices.length} ${vertexIndices.join(' ')}\n`;
         }
         return content;
      }
   }

   _exportToPoly() {
      if (['VertexCloud', 'PolygonMesh'].includes(this.cpuModel.modelType)) {
         const vertices = this.cpuModel.vertices;
         const polygons = this.cpuModel.polygons ? this.cpuModel.polygons : [];

         // Vertices
         let content = `${vertices.length} 3\n`;
         for (const vertex of vertices) {
            content += `${vertex.id} ${vertex.coords.join(' ')}\n`;
         }
         // Facets
         content += `${polygons.length}\n`;
         for (const polygon of polygons) {
            content += '1\n';
            const vertexIndices = polygon.vertices.map(vertex => vertex.id);
            content += `${vertexIndices.length} ${vertexIndices.join(' ')}\n`;
         }
         // Holes
         content += '0\n';
         return content;
      }
   }

   _exportToVisf() {
      const allowedTypes = ['VertexCloud', 'PolygonMesh', 'PolyhedronMesh'];
      if (allowedTypes.includes(this.cpuModel.modelType)) {
         this.cpuModel.vertices.sort((a, b) => a.id - b.id);
         const vertices = this.cpuModel.vertices;
         const polygons = this.cpuModel.polygons ? this.cpuModel.polygons : [];
         const polyhedrons = this.cpuModel.polyhedrons ? this.cpuModel.polyhedrons : [];
         const minVertexid = vertices[0]?.id; 

         // ViSF Header
         let content = `2 ${allowedTypes.indexOf(this.cpuModel.modelType)}\n`
         // Vertices
         content += `${vertices.length}\n`;
         for (const vertex of vertices) {
            content += `${vertex.coords.join(' ')}\n`;
         }
         // Polygons
         content += polygons.length ? `${polygons.length}\n` : '';
         for (const polygon of polygons) {
            const vertexIndices = polygon.vertices.map(vertex => vertex.id - minVertexid);
            content += `${vertexIndices.length} ${vertexIndices.join(' ')}\n`;
         }
         // Polyhedrons
         content += polyhedrons.length ? `${polyhedrons.length}\n` : '';
         for (const polyhedron of polyhedrons) {
            const polygonIndices = polyhedron.polygons.map(polygon => polygon.id - 1);
            content += `${polygonIndices.length} ${polygonIndices.join(' ')}\n`;
         }
      return content;
      }
   }

   export(format) {
      if (!this.isValid) {
         throw new Error('Model is not valid');
      }

      let header = '# Generated by Camaron Web\n';
      let content;

      if (format === 'off') {
         content = this._exportToOff();
      }
      else if (format === 'poly') {
         content = this._exportToPoly();
      }
      else if (format === 'visf') {
         content = this._exportToVisf();
      } else {
         throw new Error('Unknown export format');
      }
      
      if (!content) {
         throw new Error(`Cannot export ${this.cpuModel.modelType} to .${format}`);
      }
      return header + content;
   }
}