"use strict";

// requires "./ModelLoadStrategy";
// requires "../model/PolygonMesh";
// requires "../model/vertex";
// requires '../model/Polygon';
// requires "../helpers";


class PolyLoadStrategy extends ModelLoadStrategy {
    // https://wias-berlin.de/software/tetgen/fformats.poly.html
    load() {
        return this._load(() => {
            this.cpuModel = new PolygonMesh();
            const polygonStartIndex = this.loadModelVertices();
            this.loadModelPolygons(polygonStartIndex);
        });
    }

   // Carga los vértices del modelo tomando sus coordenadas x,y,z. Si tiene 2 dimensiones, agrega 0 como la tercera dimensión.
   loadModelVertices() {
        const vertexLineWords = getLineWords(this.fileArray[0]);
        if (!isPositiveInteger(vertexLineWords[0]) || !['2', '3'].includes(vertexLineWords[1]) || vertexLineWords.length != 4) {
            throw new Error('vertexError');
        }
        const [numVertices, dimensions] = [parseInt(vertexLineWords[0]), parseInt(vertexLineWords[1])];
        const startIndex = 1;
        if (startIndex + numVertices > this.fileArray.length) {
            throw new Error('vertexCountError');
        }

        for (let i = 0; i < numVertices; i++) {
            let vertexData = getLineWords(this.fileArray[startIndex + i]).slice(0, dimensions+1);
            if (dimensions === 2) {
                vertexData.push(0);
            }
            this.fileArray[startIndex + i] = vertexData.join(' ');
        }        
        return super._loadModelVertices(numVertices, startIndex, true);
   }

   // Carga los polígonos del modelo si el número de polígonos es un entero positivo válido y está ubicado al inicio de la lectura,
   // sin ningún valor adicional en la misma línea.
   loadModelPolygons(startIndex) {
      const polygonLineWords = getLineWords(this.fileArray[startIndex]);
      if (polygonLineWords.length != 2 || !isPositiveInteger(polygonLineWords[0])) {
        throw new Error('polygonError');
      }
      const numFacets = parseInt(polygonLineWords[0]);
      startIndex++;
      let offset = 0;
      const polygonIndices = [];
      for (let i = 0; i < numFacets; i++) {
        const facet = this.fileArray[startIndex + offset];
        const facetLineWords = getLineWords(facet);
        if (![1,2,3].includes(facetLineWords.length) || !isPositiveInteger(facetLineWords[0])) {
            console.log(facetLineWords);
            throw new Error('Facet format error');
        }
        if (facetLineWords[1] && facetLineWords[1] != '0') {
            console.warn('Warning: Holes not supported');
        }
        const facetPolygonCount = parseInt(facetLineWords[0]);
        const facetHoleCount = facetLineWords[1] ? parseInt(facetLineWords[1]) : 0;

        polygonIndices.push(...range(startIndex + offset + 1, startIndex + offset + 1 + facetPolygonCount));
        offset += 1 + facetPolygonCount + facetHoleCount;
      }
      return super._loadModelPolygons(polygonIndices.length, null, polygonIndices);
   }
}