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
         // Polygonal mesh
         if (numPolygons) {
            this.cpuModel = new PolygonMesh();
            const polygonStartIndex = this.loadModelVertices(numVertices, vertexStartIndex);
            this.loadModelPolygons(numPolygons, polygonStartIndex);
         }
         // Vertex cloud
         else {
            this.cpuModel = new VertexCloud();
            this.loadModelVertices(numVertices, vertexStartIndex);
         }
         this.cpuModel.vertices = new Array(...Object.values(this.cpuModel.vertices));
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

   _exportToVisf() {
      let content = '';
      if (this.cpuModel.modelType === 'PolygonMesh') {
         content += '2 1\n';
         const vertices = this.cpuModel.vertices;
         const polygons = this.cpuModel.polygons;

         content += `${vertices.length}\n`;
         for (const vertex of vertices) {
            content += `${vertex.coords.join(' ')}\n`;
         }

         content += `${polygons.length}\n`;
         for (const polygon of polygons) {
            const vertexIndices = polygon.vertices.map(vertex => vertex.id - 1);
            content += `${vertexIndices.length} ${vertexIndices.join(' ')}\n`;
         }

      } else if (this.cpuModel.modelType === 'VertexCloud') {
         content += '2 0\n';
         const vertices = this.cpuModel.vertices;

         content += `${vertices.length}\n`;
         for (const vertex of vertices) {
            content += `${vertex.coords.join(' ')}\n`;
         }
      }
      return content;
   }

   _exportToPoly() {
      if (this.cpuModel.modelType === 'PolygonMesh') {
         const vertices = this.cpuModel.vertices;
         const polygons = this.cpuModel.polygons;
         
         let content = `${vertices.length} 3\n`;
         for (const vertex of vertices) {
            content += `${vertex.id} ${vertex.coords.join(' ')}\n`;
         }

         content += `${polygons.length}\n`;
         for (const polygon of polygons) {
            content += '1\n';
            const vertexIndices = polygon.vertices.map(vertex => vertex.id);
            content += `${vertexIndices.length} ${vertexIndices.join(' ')}\n`;
         }
      
         return content;
      }
   }
}