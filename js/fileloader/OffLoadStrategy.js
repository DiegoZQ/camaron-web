"use strict";

// requires "./ModelLoadStrategy";
// requires "../model/PolygonMesh";
// requires "../model/vertex";
// requires '../model/Polygon';
// requires "../helpers";


class OffLoadStrategy extends ModelLoadStrategy {
   // https://segeval.cs.princeton.edu/public/off_format.html
   load() {
      return this._load(() => {
         this.cpuModel = new PolygonMesh();
         const [numVertices, numPolygons, vertexStartIndex] = this.loadHeaders();
         const polygonStartIndex = this.loadModelVertices(numVertices, vertexStartIndex);
         this.loadModelPolygons(numPolygons, polygonStartIndex);
      });
   }

   // Lee el header del .off y si no encuentra cualquiera de los 2 formatos conocidos de off arroja un error;
   // en otro caso, retorna la cantidad de vértices, polígonos y el inicio de lectura de los vértices.
   loadHeaders() {
      const headerLineWords = getLineWords(this.fileArray[0]);
      if (headerLineWords[0] != 'OFF') {
         throw new Error('header format error');
      }
      let numVertices, numPolygons, vertexStartIndex;
      // Formato 1: OFF
      //            numVertices numPolygons numEdges
      if (headerLineWords.length == 1) {
         const line = this.fileArray[1];
         const lineWords = getLineWords(line);
         if (lineWords.length != 3) 
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
      return [numVertices, numPolygons, vertexStartIndex];
   }

   // Carga los vértices del modelo si el número de vértices es un entero positivo válido.
   loadModelVertices(numVertices, startIndex) {
      if (!isPositiveInteger(numVertices)) {
         throw new Error('vertexError');
      }
      return this._loadModelVertices(parseInt(numVertices), startIndex);
   }

   // Carga los polígonos del modelo si el número de polígonos es un entero positivo válido.
   loadModelPolygons(numPolygons, startIndex) {
      if (!isPositiveInteger(numPolygons)) {
         throw new Error('polygonError');
      }
      return this._loadModelPolygons(parseInt(numPolygons), startIndex);
   }
}