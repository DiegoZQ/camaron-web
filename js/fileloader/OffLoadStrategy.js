"use strict";

import ModelLoadStrategy from "./ModelLoadStrategy";
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
         for (let i = 1; i < this.fileArray.length; i++) {
            const line = this.fileArray[i];
            const lineWords = getLineWords(line);
            if (lineWords.length != 3) 
               throw new Error('headerPartsError');
            this.vertexStart = i + 1;
            numVertices = parseInt(lineWords[0]);
            numFaces = parseInt(lineWords[1]);
         }
      }
      // Caso: OFF numVertices numFaces numEdges 
      else if (headerLineWords == 4) {
         this.vertexStart = 1;
         numVertices = parseInt(headerLineWords[1]);
         numFaces = parseInt(headerLineWords[2]);
      }
      // Caso: formato incorrecto, si no existen o son 0, arroja un error
      if (!numVertices|| !numFaces) 
         throw new Error('countError');

      this.model = new PolygonMesh(numFaces, numVertices);
   }

   createModelVertices() {
      const bounds = this.model.bounds;
      const modelVertices = this.model.vertices;
      const numVertices = modelVertices.length;

      let id = 0;
      let i = this.vertexStart;
      while(id < numVertices) {
         const line = this.fileArray[i];
         const lineWords = getLineWords(line);
         if (lineWords.length != 3) 
            throw new Error('InvalidVertexDimensions');
         const x = parseFloat(lineWords[0]);
         const y = parseFloat(lineWords[1]);
         const z = parseFloat(lineWords[2]);
         modelVertices[id] = new Vertex(id+1, x, y, z);
         if (!bounds.length) 
            bounds.push(x, y, z, x, y, z);
         else {
            bounds[0] = Math.min(bounds[0], x);
            bounds[1] = Math.min(bounds[1], y);
            bounds[2] = Math.min(bounds[2], z);
            bounds[3] = Math.max(bounds[3], x);
            bounds[4] = Math.max(bounds[4], y);
            bounds[5] = Math.max(bounds[5], z);
         }
         id++;
         i++;
      }
      this.polygonStart = i;
   }

   createModelPolygons() {
      const modelVertices = this.model.vertices;
      const polygons = this.model.polygons;
      const numPolygons = polygons.length;

      let id = 0;
      let i = this.polygonStart;
      while(id < numPolygons) {
         const line = this.fileArray[i];
         const lineWords = getLineWords(line);
         const sidesCount = parseInt(lineWords[0]);
         if (lineWords.length != sidesCount + 1) 
         	throw new Error('InvalidPolygonSideCount');
         const polygon = new Polygon(id + 1);
         // if(sidesCount === 3){var polygon = new Triangle(id);}
         //	else{var polygon = new Polygon(id);}
         const polygonVertices = polygon.vertices;
         for(let j = 1; j <= sidesCount; j++) {
            const vertexIndex = parseInt(lineWords[j]);
            // para cada índice de vértice agrega el vértice a los vértices del polígono
            polygonVertices.push(modelVertices[vertexIndex]);
            // y agrega el nuevo polígono como parte de los polígonos de cada vértice
            modelVertices[vertexIndex].polygons.push(polygon);
         }
         polygons[id] = polygon;
         id++;
         i++
      }
   }

   // https://segeval.cs.princeton.edu/public/off_format.html
   load() {
      try {
         this.checkHeader();
         this.createModelFromHeader();
         this.createModelVertices();
         if (this.model.modelType === 'PolygonMesh') 
            this.createModelPolygons();
      } catch {
         this.isValid = false;
         this.model = null;
      }
   }
}

export default OffLoadStrategy