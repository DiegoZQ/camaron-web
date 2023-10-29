"use strict";

import ModelLoadStrategy from "./ModelLoadStrategy";
import Vertex from "../model/vertex";
import Polygon from '../model/Polygon';
import { getLineWords } from "../helpers";


class OffLoadStrategy extends ModelLoadStrategy {
   constructor(fileArray) {
      super.constructor(fileArray);
      this.vertexStart = 0;
      this.polygonStart = 0;
   }

   // Verifica si existe el header OFF. Si no lo encuentra, arroja un error
   checkHeader() {
      if (!this.fileArray[0].startsWith('OFF'))
         throw new Error('headerError');
   }

   // Retorna el número de vértices y número de caras contenidos en el header. Si no los encuentra,
   // o tiene un formato inválido, arroja un error.
   createModelFromHeader() {
      const headerLineWords = getLineWords(this.fileArray[0]);
      let numVertices = null;
      let numFaces = null; 
      // Caso: OFF
      //       numVertices numFaces numEdges
      if (headerLineWords == 1) {
         const line = this.fileArray[1];
         const lineWords = getLineWords(line);
         if (lineWords.length != 3) 
            throw new Error('headerPartsError');
         numVertices = parseInt(lineWords[0]);
         numFaces = parseInt(lineWords[1]);
         this.vertexStart = 2;
      }
      // Caso: OFF numVertices numFaces numEdges 
      else if (headerLineWords == 4) {
         numVertices = parseInt(headerLineWords[1]);
         numFaces = parseInt(headerLineWords[2]);
         this.vertexStart = 1;
      }
      // Caso: formato incorrecto, si no existen o son 0, arroja un error
      if (!numVertices || !numFaces) 
         throw new Error('countError');

      this.polygonStart = this.vertexStart + numVertices;
      this.CPUModel = new PolygonMesh(numFaces, numVertices);
   }

   createModelVertices() {
      const bounds = new Float32Array(6);
      const numVertices = this.CPUModel.vertices.length;

      for (let i = 0; i < numVertices; i++) {
         const line = this.fileArray[this.vertexStart + i];
         const lineWords = getLineWords(line);
         if (lineWords.length != 3) 
            throw new Error('InvalidVertexDimensions');

         const [x, y, z] = lineWords.map(parseFloat);
         this.CPUModel.vertices[i] = new Vertex(i + 1, x, y, z);

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
      this.CPUModel.bounds = bounds;
   }

   createModelPolygons() {
      const numPolygons = this.CPUModel.polygons.length;

      for (let i = 0; i < numPolygons; i++) {
         const line = this.fileArray[this.polygonStart + i];
         const lineWords = getLineWords(line);
         const sidesCount = parseInt(lineWords[0]);

         if (lineWords.length !== sidesCount + 1) 
         	throw new Error('InvalidPolygonSideCount');

         const polygon = new Polygon(i+1);
         const polygonVertices = polygon.vertices;
         // para cada índice de vértice
         for(let j = 1; j <= sidesCount; j++) {
            const vertexIndex = parseInt(lineWords[j]);
            const modelVertex = this.CPUModel.vertices[vertexIndex];

            // agrega cada vértice a los vértices del polígono
            polygonVertices.push(modelVertex);
            // y agrega el nuevo polígono como parte de los polígonos de cada vértice
            modelVertex.polygons.push(polygon);
         }
         this.CPUModel.polygons[i + 1] = polygon;
      }
   }

   // https://segeval.cs.princeton.edu/public/off_format.html
   load() {
      try {
         this.checkHeader();
         this.createModelFromHeader();
         this.createModelVertices();
         if (this.CPUModel.modelType === 'PolygonMesh') 
            this.createModelPolygons();
      } catch {
         this.isValid = false;
         this.CPUModel = null;
      }
   }
}

export default OffLoadStrategy