"use strict";

import { vec3 } from "../external/gl-matrix";
import MVPManager from "./MVPManager";
import { colorConfig } from "../camaron/camaron-config";


class GPUModel {
   constructor(CPUModel) {
      this.CPUModel = CPUModel;
      this.MVPManager = new MVPManager(CPUModel);
      // Buffers
      this.trianglesBuffer = gl.createBuffer();
      this.edgesBuffer = gl.createBuffer();
      this.verticesBuffer = gl.createBuffer();
      this.trianglesNormalsBuffer = gl.createBuffer();
      this.verticesNormalsBuffer = gl.createBuffer();
      this.faceNormalsLinesBuffer = gl.createBuffer();
      this.vertexNormalsLinesBuffer = gl.createBuffer();
      // Shape Quantities
      this.trianglesCount = 0;
      this.edgesCount = 0;
      // Configuration
      this.loaded = 0;
   }

   // Count increasers
   increaseTriangleCounts(number) {
      this.trianglesCount += number;
   }
   increaseEdgesCounts(number) {
      this.edgesCount += number;
   }

   // Por cada polígono del CPUModel, lo descompone en un conjunto de triángulos y agrega las coordenadas de dichos triángulos
   // en un arreglo global. Sirve para dibujar las caras del modelo.
   loadTriangles() {
      const polygons = this.CPUModel.polygons;
      const polygonTrianglesVertexCoords = [];
      for (const polygon of polygons) {
         polygonTrianglesVertexCoords.concat(polygon.trianglesVertexCoords);
         this.increaseTriangleCounts(polygon.trianglesCount);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW);
      this.loaded += 1;
   }

   // Por cada vértice de cada triángulo de cada polígono, agrega la normal del polígono que comprende cada subconjunto de triángulos.
   // Sirve para representar la iluminación sobre las caras.
   loadTriangleNormals() {
      const polygons = this.CPUModel.polygons;
      // Agrega una normal para cada vértice del triángulo, 3 vértices 3 dimesiones => 9 espacios
      const trianglesNormals = new Float32Array(this.trianglesCount*9);
      for (const polygon of polygons) {
         const normal = polygon.normal;
         const polygonTrianglesCount = polygon.trianglesCount;
         for (let i = 0; i < polygonTrianglesCount; i++) {
            const j = i*9;
            trianglesNormals[j] = normal[0]; trianglesNormals[j+1] = normal[1]; trianglesNormals[j+2] = normal[2];
            trianglesNormals[j+3] = normal[0]; trianglesNormals[j+4] = normal[1]; trianglesNormals[j+5] = normal[2];
            trianglesNormals[j+6] = normal[0]; trianglesNormals[j+7] = normal[1]; trianglesNormals[j+8] = normal[2];
         }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesNormalsBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, trianglesNormals, gl.STATIC_DRAW);
      this.loaded += 1;
   }

   // Por cada normal de cada vértice de cada triángulo de cada polígono, agrega dicha normal a un array global con todas las normales del CPUModel.
   // cada 3 valores corresponden a una normal de un vértice, y cada 3*n vértices (9*n valores) corresponden a un polígono de n triángulos.
   // Sirve para representar la iluminación sobre los vértices.
   loadVertexNormals() {
      const polygons = this.CPUModel.polygons;
      const verticesNormals = new Float32Array(this.trianglesCount*9);

      for (const polygon of polygons) {
         const polygonVertices = polygon.vertices;
         const polygonTrianglesVertexIndices = polygon.trianglesVertexIndices;
         for (let i = 0; i < polygonTrianglesVertexIndices; i++) {
            const j = i*3;
            const polygonVertex = polygonVertices[polygonTrianglesVertexIndices[i]];
            const vertexNormal = polygonVertex.normal;
            verticesNormals[j] = vertexNormal[0]; 
            verticesNormals[j+1] = vertexNormal[1]; 
            verticesNormals[j+2] = vertexNormal[2];
         }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesNormalsBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, verticesNormals, gl.STATIC_DRAW);
      this.loaded += 1;
   }

   // Por cada par de vértices consecutivos de cada polígono, agrega las dos coordenadas de ambos vértices 
   // para representar una "línea" entre ambos puntos. Este cálculo es necesario para representar el wireframe de un modelo.
   loadEdges() {
      const polygons = this.CPUModel.polygons;
      for (const polygon of polygons) {
         const polygonVertices = polygon.vertices;
         this.increaseEdgesCounts(polygonVertices.length);
      }
      const edges = new Float32Array(this.edgesCount*6);
    
      for (const polygon of polygons) {
        const polygonVertices = polygon.vertices;
        for (let i = 0; i < polygonVertices.length; i++) {
            const j = i*6;
            const vertex1 = polygonVertices[i].coords;
            const vertex2 = polygonVertices[(i + 1) % polygonVertices.length].coords;

            edges[j] = vertex1[0]; edges[j+1] = vertex1[1]; edges[j+2] = vertex1[2];
            edges[j+3] = vertex2[0]; edges[j+4] = vertex2[1]; edges[j+5] = vertex2[2];
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.edgesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, edges, gl.STATIC_DRAW);
      this.loaded += 1;
   }

   // Por cada vértice del CPUModel, obtiene sus coordenadas y las almacena en un arreglo global.
   // Sirve para representar nubes de puntos.
   loadVertices() {
      const modelVertices = this.CPUModel.vertices;
      const vertices = new Float32Array(modelVertices.length*3);
 
      for (let i = 0; i < modelVertices.length; i++) {
         const j = i*3;
         const vertex1 = modelVertices[i].coords;
     
         vertices[j] = vertex1[0]; vertices[j+1] = vertex1[1]; vertices[j+2] = vertex1[2];
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      this.loaded += 1;
   }

   // Por cada vértice del CPUModel, obtiene sus coordenadas y su vector normal, suma la normal a cada vértice,
   // obteniendo así 2 puntos: el vértice y el vértice desplazado por la normal, que se agregan al arreglo global 
   // representando así una línea entre ambos puntos. Sirve para visualizar las normales de los vértices. 
   loadVertexNormalsLines() {
      const modelVertices = this.CPUModel.vertices;
      const vertexNormalsLines = new Float32Array(modelVertices.length*6);

      for (let i = 0; j < modelVertices.length; i++) {
         const j = i*6;
         const vertex1 = modelVertices[i].coords;
         const normal = modelVertices[i].normal;
     
         vec3.scale(normal, normal, this.MVPManager.modelHeight/50);
         vec3.add(normal, vertex1, normal);
     
         vertexNormalsLines[j] = vertex1[0]; vertexNormalsLines[j+1] = vertex1[1]; vertexNormalsLines[j+2] = vertex1[2];
         vertexNormalsLines[j+3] = normal[0]; vertexNormalsLines[j+4] = normal[1]; vertexNormalsLines[j+5] = normal[2];
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalsLinesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertexNormalsLines, gl.STATIC_DRAW);
      this.loaded += 1;
   }

   // Por cada polígono del CPUModel, obtiene las coordenadas de su centro y su vector normal, suma la normal al centro,
   // obteniendo así 2 puntos: el centro y el centro desplazado por la normal, que se agregan al arreglo global 
   // representando así una línea entre ambos puntos. Sirve para visualizar las normales de las caras. 
   loadFaceNormalsLines() {
      const modelPolygons = this.CPUModel.polygons;
      const faceNormalsLines = new Float32Array(modelPolygons.length*6);

      for(let i = 0; i < modelPolygons.length; i++){
         const j = i*6;
         const normal = modelPolygons[i].normal;
         const center = modelPolygons[i].geometricCenter;
     
         vec3.scale(normal, normal, this.MVPManager.modelHeight/50);
         vec3.add(normal, center, normal);
     
         faceNormalsLines[j] = center[0]; faceNormalsLines[j+1] = center[1]; faceNormalsLines[j+2] = center[2];
         faceNormalsLines[j+3] = normal[0]; faceNormalsLines[j+4] = normal[1]; faceNormalsLines[j+5] = normal[2];
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.faceNormalsLinesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, faceNormalsLines, gl.STATIC_DRAW);
      this.loaded += 1;
   }
  
   get color() {
      return vec4.fromValues(0.7, 0.7, 0.7, 1);
   }

   // Obtiene un arreglo general con los colores de cada vértice de los triángulos que conforman el CPUModel. 
   // Si están seleccionados, marca el triángulo de un color distinto.
   get colorMatrix() {
      const polygons = this.CPUModel.polygons;
      const colors = new Float32Array(this.trianglesCount*9);
   
      for (const polygon of polygons) {
         for (let i = 0; i < polygon.trianglesCount; i++) {
            const j = i*9;
            let color;
            if (polygon.isSelected) 
               color = colorConfig.selectedColor;
            else 
               color = colorConfig.baseColor;

            colors[j] = color[0]; colors[j+1] = color[1]; colors[j+2] = color[2];
            colors[j+3] = color[0]; colors[j+4] = color[1]; colors[j+5] = color[2];
            colors[j+6] = color[0]; colors[j+7] = color[1]; colors[j+8] = color[2];
         }
      }
      return new Float32Array(colors);
   }
}

export default GPUModel;