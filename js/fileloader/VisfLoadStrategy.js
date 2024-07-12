"use strict";

// requires "./ModelLoadStrategy";
// requires "../model/PolygonMesh";
// requires "../model/vertex";
// requires '../model/Polygon';
// requires "../helpers";


class VisfLoadStrategy extends ModelLoadStrategy {
   // https://repositorio.uchile.cl/bitstream/handle/2250/191821/Generador-de-mallas-de-poliedros-en-tres-dimensiones.pdf?sequence=5&isAllowed=y
   load() {
      const meshType = this.loadHeader();
      // Vertex cloud
      if (meshType === 0) {
         this.model = new VertexCloud();
         this.loadModelVertices(1);
      }
      // Polygonal mesh
      else if (meshType === 1) {
         this.model = new PolygonMesh();
         const polygonStartIndex = this.loadModelVertices(1);
         this.loadModelPolygons(polygonStartIndex);
      }
      // Polyhedral mesh
      else if (meshType === 2) {
         this.model = new PolyhedronMesh();
         const polygonStartIndex = this.loadModelVertices(1);
         const polyhedronStartIndex = this.loadModelPolygons(polygonStartIndex);
         this.loadModelPolyhedrons(polyhedronStartIndex);
      } else {
         throw new Error('mesh type error');
      }
      this.model.vertices = Array.from(Object.values(this.model.vertices));
   }

   // Lee el header del .ViSF y si no encuentra el formato conocido para la lectura del modelo en ASCII (primer valor == 2),
   // arroja un error.
   loadHeader() {
      const headerLineWords = getLineWords(this.fileArray[0]);
      if (headerLineWords.length != 2 || headerLineWords[0] != '2' || !['0', '1', '2'].includes(headerLineWords[1])) {
         throw new Error('headerError');
      }
      return parseInt(headerLineWords[1]);
   }

   // Carga los vértices del modelo si el número de vértices es un entero positivo válido y está ubicado al inicio de la lectura,
   // sin ningún valor adicional en la misma línea.
   loadModelVertices(startIndex) {
      const vertexLineWords = getLineWords(this.fileArray[startIndex]);
      if (vertexLineWords.length != 1 || !isPositiveInteger(vertexLineWords[0])) {
         throw new Error('vertexError');
      }
      startIndex++;
      const numVertices = parseInt(vertexLineWords[0]);
      return super.loadModelVertices(numVertices, startIndex);
   }

   // Carga los polígonos del modelo si el número de polígonos es un entero positivo válido y está ubicado al inicio de la lectura,
   // sin ningún valor adicional en la misma línea.
   loadModelPolygons(startIndex) {
      const polygonLineWords = getLineWords(this.fileArray[startIndex]);
      if (polygonLineWords.length != 1 || !isPositiveInteger(polygonLineWords[0])) {
         throw new Error('polygonError');
      }
      startIndex++;
      const numPolygons = parseInt(polygonLineWords[0]);
      return super.loadModelPolygons(numPolygons, startIndex);
   }

   // Carga los poliedros del modelo si el número de poliedros es un entero positivo válido y está ubicado al inicio de la lectura,
   // sin ningún valor adicional en la misma línea.
   loadModelPolyhedrons(startIndex) {
      const startLineWords = getLineWords(this.fileArray[startIndex]);
      if (startLineWords.length != 1 || !isNonNegativeInteger(startLineWords[0])) {
         throw new Error('polyhedronError');
      }
      startIndex++;

      const startNumber = parseInt(startLineWords[0]);
      if (startIndex + startNumber > this.fileArray.length) {
         throw new Error('polyhedronCountError');
      }
      let numPolyhedrons;

      // Si no hay relaciones se vecindad
      if (startIndex + startNumber == this.fileArray.length) {
         numPolyhedrons = startNumber;
      // Si hay relaciones se vecindad
      } else {
         if (startIndex + startNumber == this.fileArray.length - 1) {
            startIndex += 1;
         } else {
            startIndex += this.model.polygons.length;
         }
         const newStartLineWords = getLineWords(this.fileArray[startIndex]);
         if (newStartLineWords.length != 1 || !isNonNegativeInteger(newStartLineWords[0])) {
            throw new Error('polyhedronError');
         }
         startIndex++;
         numPolyhedrons = parseInt(newStartLineWords[0]);
      }
      
      if (startIndex + numPolyhedrons > this.fileArray.length) {
         throw new Error('polyhedronCountError');
      }
      const polyhedrons = new Array(numPolyhedrons);
      for (let i = 0; i < numPolyhedrons; i++) {
         const line = this.fileArray[startIndex + i];
         const lineWords = getLineWords(line);
         const facesCount = parseInt(lineWords[0]);
         if (lineWords.length !== facesCount + 1) 
         	throw new Error('polyhedronFaceCountError');

         const polyhedron = new Polyhedron(i+1);
         // para cada índice de polígono
         for(let j = 1; j <= facesCount; j++) {
            const polygonIndex = parseInt(lineWords[j]);
            const polygon = this.model.polygons[polygonIndex];
            for (const polygonVertex of polygon.vertices) {
               polyhedron.vertices[' ' + polygonVertex.id] = polygonVertex;
               polygonVertex.polyhedrons[' ' + polyhedron.id] = polyhedron;
            }
            // agrega cada cara a las caras del poliedro.
            polyhedron.polygons.push(polygon);
         }
         polyhedron.vertices = Array.from(Object.values(polyhedron.vertices));
         polyhedrons[i] = polyhedron;
      }
      Object.keys(this.model.vertices).forEach(key => {
         this.model.vertices[key].polyhedrons = Array.from(Object.values(this.model.vertices[key].polyhedrons));
      })
      this.model.polyhedrons = polyhedrons;

   }

   _exportToVisf() {
      return this.fileArray.join('\n');
   }
}