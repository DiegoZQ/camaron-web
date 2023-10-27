"use strict";

import ModelLoadStrategy from "./loader-base";
import Polygon from '../model/polygon';
import { getLineWords } from "../helpers";


class OffLoadStrategy extends ModelLoadStrategy {
   constructor(fileArray) {
      super.constructor(fileArray);
      this.vertexStart = 0;
      this.polygonStart = 0;
   }

   // Retorna el índice de la línea donde empieza el header (flag OFF). Si no lo encuentra, 
   // o tiene un formato inválido, arroja un error.
   findHeaderIndex() {
      for (const i in this.fileArray) {
         const line = this.fileArray[i].trim();
         // Si es un comentario, lo ignora
         if (line.startsWith('#')) 
            continue;
         // Si es la flag que busco, la retorna
         if (line.startsWith('OFF')) 
            return i;
         // Si no es la flag o un comentario, es inválido
         else
            break
      }
      // No se encontró la flag o había algo que no era un comentario antes de la flag
      throw new Error('headerError');
   }

   // Retorna el número de vértices y número de caras contenidos en el header. Si no los encuentra,
   // o tiene un formato inválido, arroja un error.
   createModelFromHeader(headerIndex) {
      const headerLine = this.fileArray[headerIndex];
      const headerLineWords = getLineWords(headerLine);
      let numVertices = null;
      let numFaces = null; 
      // Caso: OFF
      //       numVertices numFaces numEdges
      if (headerLineWords == 1) {
         for (const i = headerIndex + 1; i < this.fileArray.length; i++) {
            const line = this.fileArray[i].trim();
            if (line && !line.startsWith('#')) {
               const lineWords = getLineWords(line);
               if (lineWords.length != 3) 
                  throw new Error('headerPartsError');
               this.vertexStart = i + 1;
               numVertices = parseInt(lineWords[0]);
               numFaces = parseInt(lineWords[1]);
            }
         }
      }
      // Caso: OFF numVertices numFaces numEdges 
      else if (headerLineWords == 4) {
         this.vertexStart = headerIndex + 1;
         numVertices = parseInt(headerLineWords[1]);
         numFaces = parseInt(headerLineWords[2]);
      }
      // Caso: formato incorrecto
      if (numVertices === null || numFaces === null) 
         throw new Error('countError');

      this.getModel() = numFaces == 0 ? new VertexCloud(numVertices) : new PolygonMesh(numFaces, numVertices);
   }

   createModelVertices() {
		const model = this.getModel()
      const bounds = model.getBounds();
      const modelVertices = model.getVertices();
      const numVertices = model.getVerticesCount();

      let id = 0;
      let i = this.vertexStart;
      while(id < numVertices) {
         const line = this.fileArray[i].trim();
         if (line && !line.startsWith('#')) {
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
         }
         i++;
      }
      this.polygonStart = i;
   }

   createModelPolygons() {
		const model = this.getModel();
      const modelVertices = model.getVertices();
      const polygons = model.getPolygons();
      const numPolygons = model.getPolygonsCount();

      let id = 0;
      let i = this.polygonStart;
      while(id < numPolygons) {
         const line = this.fileArray[i].trim();
         if (line && !line.startsWith('#')) {
         	const lineWords = getLineWords(line);
         	const sidesCount = parseInt(lineWords[0]);
         	if (lineWords.length != sidesCount + 1) 
            	throw new Error('InvalidPolygonSideCount');
         	const polygon = new Polygon(id + 1);
            // if(sidesCount === 3){var polygon = new Triangle(id);}
            //	else{var polygon = new Polygon(id);}
            const polygonVertices = polygon.getVertices();
            for(let j = 1; j <= sidesCount; j++) {
               const vertexIndex = parseInt(lineWords[j]);
               // para cada índice de vértice agrega el vértice a los vértices del polígono
               polygonVertices.push(modelVertices[vertexIndex]);
               // y agrega el nuevo polígono como parte de los polígonos de cada vértice
               modelVertices[vertexIndex].getPolygons().push(polygon);
            }
            polygons[id] = polygon;
            id++;
         }
         i++
      }
   }

   // https://segeval.cs.princeton.edu/public/off_format.html
   load() {
		const model = this.getModel();
      try {
         const headerIndex = this.findHeaderIndex();
         this.createModelFromHeader(headerIndex);
         this.createModelVertices();
         if (model.modelType === 'PolygonMesh') 
            this.createModelPolygons();
      } catch {
         this.valid = false;
         model = null;
      }
   }
}

export default OffLoadStrategy