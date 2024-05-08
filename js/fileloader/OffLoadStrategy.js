"use strict";

// requires "./ModelLoadStrategy";
// requires "../model/PolygonMesh";
// requires "../model/vertex";
// requires '../model/Polygon';
// requires "../helpers";


// Puede cargar PolygonMesh y VertexCloud, también puede exportar a PolygonMesh y VertexCloud en visf y poly
class OffLoadStrategy extends ModelLoadStrategy {
   // https://segeval.cs.princeton.edu/public/off_format.html
   load() {
      return super.load(() => {
         const [numVertices, numPolygons, vertexStartIndex] = this.loadHeader();
         // Vertex cloud
         if (!numPolygons) {
            this.model = new VertexCloud();
            this.loadModelVertices(numVertices, vertexStartIndex);
         }
         // Polygon mesh
         else {
            this.model = new PolygonMesh();
            const polygonStartIndex = this.loadModelVertices(numVertices, vertexStartIndex);
            this.loadModelPolygons(numPolygons, polygonStartIndex);
         }
         this.model.vertices = new Array(...Object.values(this.model.vertices));
      });
   }

   // Lee el header del .off y si no encuentra cualquiera de los 2 formatos conocidos de off arroja un error;
   // en otro caso, retorna la cantidad de vértices, polígonos y el inicio de lectura de los vértices.
   loadHeader() {
      const headerLineWords = getLineWords(this.fileArray[0]);
      if (headerLineWords[0] != 'OFF') {
         throw new Error('header format error');
      }
      let numVertices, numPolygons, vertexStartIndex;
      // Formato 1: OFF
      //            numVertices numPolygons numEdges
      if (headerLineWords.length == 1) {
         const lineWords = getLineWords(this.fileArray[1]);
         if (lineWords.length !== 3) 
            throw new Error('header format error');
         numVertices = lineWords[0];
         numPolygons = lineWords[1];
         vertexStartIndex = 2;
      // Formato 2: OFF numVertices numPolygons numEdges 
      } else if (headerLineWords.length == 4) {
         numVertices = headerLineWords[1];
         numPolygons = headerLineWords[2];
         vertexStartIndex = 1;
      } else {
         throw new Error('header format error');
      }
      if (!isPositiveInteger(numVertices)) {
         throw new Error('vertexError');
      }
      if (!isNonNegativeInteger(numPolygons)) {
         throw new Error('polygonError');
      }
      return [parseInt(numVertices), parseInt(numPolygons), vertexStartIndex];
   }
   
   _exportToOff() {
      return this.fileArray.join('\n');
   }
}