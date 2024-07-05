"use strict";


class ModelLoadStrategy {
   constructor(fileArray) {
      this.fileArray = this.normalizeFileArray(fileArray);
      this.isValid = null;
      this.model = null;
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

   load() {
      // Implementar
   }

   doLoad() {
      try {
         this.load()
         this.isValid = true;
      } catch (error) {
         this.isValid = false;
         this.model = null;
         console.warn(error);
      }
      return this.model;
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
      this.model.vertices = vertices;
      this.model.bounds = bounds;
      this.model.center = vec3.fromValues(
         (bounds[0] + bounds[3]) / 2,
         (bounds[1] + bounds[4]) / 2,
         (bounds[2] + bounds[5]) / 2
      );
      this.model.modelWidth = Math.abs(bounds[3] - bounds[0]);
      this.model.modelHeight = Math.abs(bounds[4] - bounds[1]);
      this.model.modelDepth = Math.abs(bounds[5] - bounds[2]);
      return startIndex + numVertices;
   }

   // Carga todos los polígonos del modelo partiendo por una cantidad de vértices a leer y un índice de inicio.
   loadModelPolygons(numPolygons, startIndex) {
      if (startIndex + numPolygons > this.fileArray.length) {
         throw new Error('polygonCountError');
      }
      const polygons = new Array(numPolygons);
      for (let i = 0; i < numPolygons; i++) {
         const line = this.fileArray[startIndex + i];
         const lineWords = getLineWords(line);
         const sidesCount = parseInt(lineWords[0]);
         if (lineWords.length < sidesCount + 1 || lineWords.length > sidesCount + 1 + 3) {
            throw new Error('polygonSideCountError');
         }
         const polygon = new Polygon(i+1);
         // para cada índice de vértice
         for(let j = 1; j <= sidesCount; j++) {
            const vertexIndex = parseInt(lineWords[j]);
            const vertex = this.model.vertices[vertexIndex];
            // agrega cada vértice a los vértices del polígono
            polygon.vertices.push(vertex);
            // y agrega el nuevo polígono como parte de los polígonos de cada vértice
            vertex.polygons.push(polygon);
         }
         polygons[i] = polygon;
      }
      this.model.polygons = polygons;
      return startIndex + numPolygons;
   }

   _exportToOff() {
      const allowedTypes = ['VertexCloud', 'PolygonMesh'];
      if (allowedTypes.includes(this.model.modelType)) {
         this.model.vertices.sort((a, b) => a.id - b.id);
         const vertices = this.model.vertices;
         const vertexIds = vertices.map(vertex => vertex.id);
         const polygons = this.model.polygons ? this.model.polygons : [];

         // OFF Header
         let content = `OFF\n${vertices.length} ${polygons.length} 0\n`;
         // Vertices
         for (const vertex of vertices) {
            content += `${vertex.coords.join(' ')}\n`;
         }
         // Polygons
         for (const polygon of polygons) {
            if (polygon.holes.length) {
               throw new Error('Cannot export polygons with holes to .off');
            }
            const vertexIndices = polygon.vertices.map(vertex => vertexIds.indexOf(vertex.id));
            content += `${vertexIndices.length} ${vertexIndices.join(' ')}\n`;
         }
         return content;
      }
   }

   _exportToPoly() {
      if (['VertexCloud', 'PolygonMesh'].includes(this.model.modelType)) {
         const vertices = this.model.vertices;
         const polygons = this.model.polygons ? this.model.polygons : [];

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
      if (allowedTypes.includes(this.model.modelType)) {
         this.model.vertices.sort((a, b) => a.id - b.id);
         const vertices = this.model.vertices;
         const vertexIds = vertices.map(vertex => vertex.id);
         const polygons = this.model.polygons ? this.model.polygons : [];
         const polygonIds = polygons.map(polygon => polygon.id);
         const polyhedrons = this.model.polyhedrons ? this.model.polyhedrons : [];

         // ViSF Header
         let content = `2 ${allowedTypes.indexOf(this.model.modelType)}\n`
         // Vertices
         content += `${vertices.length}\n`;
         for (const vertex of vertices) {
            content += `${vertex.coords.join(' ')}\n`;
         }
         // Polygons
         content += polygons.length ? `${polygons.length}\n` : '';
         for (const polygon of polygons) {
            if (polygon.holes.length) {
               throw new Error('Cannot export .poly with holes to .visf');
            }
            const vertexIndices = polygon.vertices.map(vertex => vertexIds.indexOf(vertex.id));
            content += `${vertexIndices.length} ${vertexIndices.join(' ')}\n`;
         }
         // Polyhedrons
         content += polyhedrons.length ? `${polyhedrons.length}\n` : '';
         for (const polyhedron of polyhedrons) {
            const polygonIndices = polyhedron.polygons.map(polygon => polygonIds.indexOf(polygon.id));
            content += `${polygonIndices.length} ${polygonIndices.join(' ')}\n`;
         }
      return content;
      }
   }

   _exportToNode() {
      const vertices = this.model.vertices;
      let content = `${vertices.length} 3\n`;
      for (const vertex of vertices) {
         content += `${vertex.id} ${vertex.coords.join(' ')}\n`;
      }
      return content;
   }

   _exportToFace() {
      if (this.model.modelType == 'PolygonMesh') {
         const polygons = this.model.polygons;
         let content = `${polygons.length}\n`;
         for (const polygon of polygons) {
            if (polygon.vertices.length > 3) {
               throw new Error('Cannot convert non triangle polygons to .face');
            }
            const vertexIndices = polygon.vertices.map(vertex => vertex.id);
            content += `${polygon.id} ${vertexIndices.join(' ')}\n`;
         }
         return content;
      }
   }

   _exportToEle() {
      if (this.model.modelType == 'PolyhedronMesh') {
         const polyhedrons = this.model.polyhedrons;
         let content = `${polyhedrons.length} 4\n`;
         for (const polyhedron of polyhedrons) {
            if (polyhedron.polygons.length > 4) {
               throw new Error('Cannot convert non tetrahedron polyhedrons to .ele');
            }
            for (const polygon of polyhedron.polygons) {
               if (polygon.vertices.length > 3) {
                  throw new Error('Cannot convert non triangle polygons to .ele');
               }
            }
            const vertexIds = polyhedron.vertices.map(vertex => vertex.id);
            // Los primeros 3 vértices se invierte su orientación, ya que por construcción, estos se obtienen siguiendo una
            // dirección en contra de las agujas del reloj, no obstante la función que lee posteriormente esta línea para reconvertirla 
            // en sus 4 caras, espera que los primeros 3 vértices estén a favor de las agujas del reloj.
            content += `${polyhedron.id} ${vertexIds[0]} ${vertexIds[2]} ${vertexIds[1]} ${vertexIds[3]}\n`;
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
      } else if (format === 'poly') {
         content = this._exportToPoly();
      } else if (format === 'visf') {
         content = this._exportToVisf();
      } else if (format === 'node') {
         content = this._exportToNode();
      }  else if (format === 'face') {
         content = this._exportToFace();
      } else if (format === 'ele') {
         content = this._exportToEle();
      } else {
         throw new Error('Unknown export format');
      }
      if (!content) {
         throw new Error(`Cannot export ${this.model.modelType} to .${format}`);
      }
      return header + content;
   }
}