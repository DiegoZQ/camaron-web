"use strict";

// requires "../external/gl-matrix";
// requires "./MVPManager";
// requires "../config";


class GPUModel {
   constructor(cpuModel) {
      this.cpuModel = cpuModel;
      this.MVPManager = new MVPManager(cpuModel);
      // Buffers
      this.trianglesBuffer = gl.createBuffer();
      this.edgesBuffer = gl.createBuffer();
      this.verticesBuffer = gl.createBuffer();
      this.trianglesNormalsBuffer = gl.createBuffer();
      this.verticesNormalsBuffer = gl.createBuffer();
      this.faceNormalsLinesBuffer = gl.createBuffer();
      this.vertexNormalsLinesBuffer = gl.createBuffer();
      this.vertexIdsBuffer = {position: gl.createBuffer(), texcoord: gl.createBuffer()};
      this.faceIdsBuffer = {position: gl.createBuffer(), texcoord: gl.createBuffer()};
      // Shape Quantities
      this.trianglesCount = 0;
      this.edgesCount = 0;
      this.vertexIdsLength = 0;
      this.polygonIdsLength = 0;
      // Configuration
      this.loaded = false;
      this._fontScale = null; 
   }

   // Count increasers
   increaseTriangleCounts(number) {
      this.trianglesCount += number;
   }
   increaseEdgesCounts(number) {
      this.edgesCount += number;
   }

   load() {
      if (this.cpuModel.modelType === 'VertexCloud') {
         this.loadVertices();
         this.loadVertexIds();
      }
      else if (this.cpuModel.modelType === 'PSLG') {
         this.loadEdges();
         this.loadVertices();
         this.loadVertexIds();
      }
      else if (this.cpuModel.modelType === 'PolygonMesh' || this.cpuModel.modelType === 'PolyhedronMesh') {
         this.loadTriangles();
         this.loadTrianglesNormals();
         this.loadVertexNormals();
         this.loadEdgesFromPolygons();
         this.loadVertices();
         this.loadVertexNormalsLines();
         this.loadFaceNormalsLines();
         this.loadVertexIds();
         this.loadFaceIds();
      }
      this.loaded = true;
   }

   // Por cada polígono del cpuModel, lo descompone en un conjunto de triángulos y agrega las coordenadas de dichos triángulos
   // en un arreglo global. Sirve para dibujar las caras del modelo.
   loadTriangles() {
      const polygons = this.cpuModel.polygons;
      let polygonTrianglesVertexCoords = [];
      for (const polygon of polygons) {
         polygonTrianglesVertexCoords = polygonTrianglesVertexCoords.concat(polygon.trianglesVertexCoords);
         this.increaseTriangleCounts(polygon.trianglesCount);
      }
      const triangleData = new Float32Array(polygonTrianglesVertexCoords);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, triangleData, gl.STATIC_DRAW);
   }

   // Por cada vértice de cada triángulo de cada polígono, agrega la normal del polígono que comprende cada subconjunto de triángulos.
   // Sirve para representar la iluminación sobre las caras.
   loadTrianglesNormals() {
      const polygons = this.cpuModel.polygons;
      // Agrega una normal para cada vértice del triángulo, 3 vértices 3 dimesiones => 9 espacios
      const triangleNormalData = new Float32Array(this.trianglesCount*9);

      let j = 0;
      for (const polygon of polygons) {
         const normal = polygon.normal;
         const polygonTrianglesCount = polygon.trianglesCount;
         for (let i = 0; i < polygonTrianglesCount; i++) {
            triangleNormalData[j] = normal[0]; triangleNormalData[j+1] = normal[1]; triangleNormalData[j+2] = normal[2];
            triangleNormalData[j+3] = normal[0]; triangleNormalData[j+4] = normal[1]; triangleNormalData[j+5] = normal[2];
            triangleNormalData[j+6] = normal[0]; triangleNormalData[j+7] = normal[1]; triangleNormalData[j+8] = normal[2];

            j += 9;
         }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesNormalsBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, triangleNormalData, gl.STATIC_DRAW);
   }

   // Por cada normal de cada vértice de cada triángulo de cada polígono, agrega dicha normal a un array global con todas las normales del cpuModel.
   // cada 3 valores corresponden a una normal de un vértice, y cada 3*n vértices (9*n valores) corresponden a un polígono de n triángulos.
   // Sirve para representar la iluminación sobre los vértices.
   loadVertexNormals() {
      const polygons = this.cpuModel.polygons;
      const vertexNormalData = new Float32Array(this.trianglesCount*9);

      let j = 0;
      for (const polygon of polygons) {
         const polygonTrianglesVertexIndices = polygon.trianglesVertexIndices;
         for (let i = 0; i < polygonTrianglesVertexIndices.length; i++) {
            const polygonVertex = polygon.vertices[polygonTrianglesVertexIndices[i]];
            const vertexNormal = polygonVertex.normal;
            vertexNormalData[j] = vertexNormal[0]; 
            vertexNormalData[j+1] = vertexNormal[1]; 
            vertexNormalData[j+2] = vertexNormal[2];

            j += 3;
         }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesNormalsBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertexNormalData, gl.STATIC_DRAW);
   }

   loadEdges() {
      const edges = this.cpuModel.edges;

      this.increaseEdgesCounts(edges.length);
      const edgeData = new Float32Array(this.edgesCount*6);

      let j = 0;
      for (const edge of edges) {
         const vertex1 = edge.startVertex.coords;
         const vertex2 = edge.endVertex.coords;
         edgeData[j] = vertex1[0]; edgeData[j+1] = vertex1[1]; edgeData[j+2] = vertex1[2];
         edgeData[j+3] = vertex2[0]; edgeData[j+4] = vertex2[1]; edgeData[j+5] = vertex2[2];
         j += 6;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.edgesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, edgeData, gl.STATIC_DRAW);
   }

   // Por cada par de vértices consecutivos de cada polígono, agrega las dos coordenadas de ambos vértices 
   // para representar una "línea" entre ambos puntos. Este cálculo es necesario para representar el wireframe de un modelo.
   loadEdgesFromPolygons() {
      const polygons = this.cpuModel.polygons;

      for (const polygon of polygons) {
         const polygonVertices = polygon.vertices;
         this.increaseEdgesCounts(polygonVertices.length);
      }
      const edgeData = new Float32Array(this.edgesCount*6);
      let k = 0;
      for (const polygon of polygons) {
         const polygonVertices = polygon.vertices;
         const polygonHoles = polygon.holes;
         // Si el polígono no tiene agujero, une cada vértice consecutivo con una línea
         if (!polygonHoles.length) {
            for (let i = 0; i < polygonVertices.length; i++) {
               const vertex1 = polygonVertices[i].coords;
               const vertex2 = polygonVertices[(i + 1) % polygonVertices.length].coords;
               edgeData[k] = vertex1[0]; edgeData[k+1] = vertex1[1]; edgeData[k+2] = vertex1[2];
               edgeData[k+3] = vertex2[0]; edgeData[k+4] = vertex2[1]; edgeData[k+5] = vertex2[2];
               k += 6;
            }
         }
         // Si tiene uno o más agujeros, une cada segmento continuo del polígono con una línea,
         // esto es, une los puntos consecutivos del polígono exterior y los puntos consecutivos de cada
         // agujero contenido. Ej: si holes es [4], une de 0 a 3 los vértices (polígono exterior) y de 
         // 4 a polygonVertices.length los vértices correspondiente al agujero que empieza con el vértice 4.
         else {
            for (let i = 0; i <= polygonHoles.length; i++) {
               const start = i === 0 ? 0 : polygonHoles[i-1];
               const end = i === polygonHoles.length ? polygonVertices.length : polygonHoles[i]; 
               for (let j = start; j < end; j++) {
                  const vertex1 = polygonVertices[j].coords;
                  const vertex2 = polygonVertices[Math.max(start, (j + 1) % end)].coords;
                  edgeData[k] = vertex1[0]; edgeData[k+1] = vertex1[1]; edgeData[k+2] = vertex1[2];
                  edgeData[k+3] = vertex2[0]; edgeData[k+4] = vertex2[1]; edgeData[k+5] = vertex2[2];
                  k += 6;
               }
            }
         }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.edgesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, edgeData, gl.STATIC_DRAW);
   }

   // Por cada vértice del cpuModel, obtiene sus coordenadas y las almacena en un arreglo global.
   // Sirve para representar nubes de puntos.
   loadVertices() {
      const vertices = this.cpuModel.vertices;
      const holes = this.cpuModel.holes;

      const vertexDataSize = holes && holes.length ? 4*(vertices.length + holes.length) : vertices.length*3;

      const vertexData = new Float32Array(vertexDataSize);

      if (holes && holes.length) {
         for (let i = 0; i < vertices.length; i++) {
            const j = i*4;
            const vertex = vertices[i].coords;
        
            vertexData[j] = vertex[0]; vertexData[j+1] = vertex[1]; vertexData[j+2] = vertex[2];
            vertexData[j+3] = 0.0;
         }
         for (let i = 0; i < holes.length; i++) {
            const j = 4*vertices.length + i*4;
            const hole = holes[i].coords;
        
            vertexData[j] = hole[0]; vertexData[j+1] = hole[1]; vertexData[j+2] = hole[2];
            vertexData[j+3] = 1.0;
         }
      } else {
         for (let i = 0; i < vertices.length; i++) {
            const j = i*3;
            const vertex = vertices[i].coords;
        
            vertexData[j] = vertex[0]; vertexData[j+1] = vertex[1]; vertexData[j+2] = vertex[2];
         }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
   }

   // Por cada vértice del cpuModel, obtiene sus coordenadas y su vector normal, suma la normal a cada vértice,
   // obteniendo así 2 puntos: el vértice y el vértice desplazado por la normal, que se agregan al arreglo global 
   // representando así una línea entre ambos puntos. Sirve para visualizar las normales de los vértices. 
   loadVertexNormalsLines() {
      const vertices = this.cpuModel.vertices;
      const vertexNormalLineData = new Float32Array(vertices.length*6);

      for (let i = 0; i < vertices.length; i++) {
         const j = i*6;
         const vertex = vertices[i].coords;
         const normal = vertices[i].normal;
     
         vec3.scale(normal, normal, this.MVPManager.modelHeight/50);
         vec3.add(normal, vertex, normal);
     
         vertexNormalLineData[j] = vertex[0]; vertexNormalLineData[j+1] = vertex[1]; vertexNormalLineData[j+2] = vertex[2];
         vertexNormalLineData[j+3] = normal[0]; vertexNormalLineData[j+4] = normal[1]; vertexNormalLineData[j+5] = normal[2];
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalsLinesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertexNormalLineData, gl.STATIC_DRAW);
   }

   // Por cada polígono del cpuModel, obtiene las coordenadas de su centro y su vector normal, suma la normal al centro,
   // obteniendo así 2 puntos: el centro y el centro desplazado por la normal, que se agregan al arreglo global 
   // representando así una línea entre ambos puntos. Sirve para visualizar las normales de las caras. 
   loadFaceNormalsLines() {
      const polygons = this.cpuModel.polygons;
      const faceNormalLineData = new Float32Array(polygons.length*6);

      for(let i = 0; i < polygons.length; i++){
         const j = i*6;
         const normal = polygons[i].normal;
         const center = polygons[i].geometricCenter;
     
         vec3.scale(normal, normal, this.MVPManager.modelHeight/50);
         vec3.add(normal, center, normal);
     
         faceNormalLineData[j] = center[0]; faceNormalLineData[j+1] = center[1]; faceNormalLineData[j+2] = center[2];
         faceNormalLineData[j+3] = normal[0]; faceNormalLineData[j+4] = normal[1]; faceNormalLineData[j+5] = normal[2];
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.faceNormalsLinesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, faceNormalLineData, gl.STATIC_DRAW);
   }

   get fontScale() {
      if (this._fontScale == null) {
         const maxArea = Math.max(this.MVPManager.modelWidth, this.MVPManager.modelHeight) * this.MVPManager.modelDepth;
         this._fontScale = (Math.sqrt(maxArea/this.cpuModel.vertices.length)/fontInfo.letterHeight) * 0.1; 
      }
      return this._fontScale;
   }

   loadVertexIds() {
      const vertices = this.cpuModel.vertices;
      const positions = [];
      const texcoords = [];

      const maxX = fontInfo.textureWidth;
      const maxY = fontInfo.textureHeight;
      const scale = this.fontScale; 

      for (const vertex of vertices) {
         const id = `${vertex.id}`;
         this.vertexIdsLength += id.length;
         const idWidth = id.length*(fontInfo.width)*scale;
         const idHeight = fontInfo.letterHeight*scale;
         const vertexIdCenter = vertex.coords;
         let x = -idWidth/2;
         for (const number of id) {
            const glyphInfo = fontInfo.glyphInfos[number];
            if (glyphInfo) {
               const x2 = x + glyphInfo.width*scale;
               const u1 = glyphInfo.x / maxX;
               const v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
               const u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
               const v2 = glyphInfo.y / maxY;
            
               // triangle 1
               positions.push(...vertexIdCenter, x, idHeight/2);
               texcoords.push(u1, v2);

               positions.push(...vertexIdCenter, x2, -idHeight/2);
               texcoords.push(u2, v1);
            
               positions.push(...vertexIdCenter, x, -idHeight/2);
               texcoords.push(u1, v1);

               // triangle 2
               positions.push(...vertexIdCenter, x2, idHeight/2);
               texcoords.push(u2, v2);
            
               positions.push(...vertexIdCenter, x2, -idHeight/2);
               texcoords.push(u2, v1);               
            
               positions.push(...vertexIdCenter, x, idHeight/2);
               texcoords.push(u1, v2);

               x += glyphInfo.width*scale;
            } 
         }
      }
      const positionData = new Float32Array(positions);
      const texcoordData = new Float32Array(texcoords);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexIdsBuffer.position);
      gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexIdsBuffer.texcoord);
      gl.bufferData(gl.ARRAY_BUFFER, texcoordData, gl.STATIC_DRAW);
   }

   loadFaceIds() {
      const polygons = this.cpuModel.polygons;
      const positions = [];
      const texcoords = [];

      const maxX = fontInfo.textureWidth;
      const maxY = fontInfo.textureHeight;
      const scale = this.fontScale; 
      
      for (const polygon of polygons) {
         const id = `${polygon.id}`;
         this.polygonIdsLength += id.length;
         const idWidth = id.length*(fontInfo.width)*scale;
         const idHeight = fontInfo.letterHeight*scale;
         const polygonIdCenter = polygon.geometricCenter;
         let x = -idWidth/2;
         for (const number of id) {
            const glyphInfo = fontInfo.glyphInfos[number];
            if (glyphInfo) {
               const x2 = x + glyphInfo.width*scale;
               const u1 = glyphInfo.x / maxX;
               const v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
               const u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
               const v2 = glyphInfo.y / maxY;
            
               // triangle 1
               positions.push(...polygonIdCenter, x, idHeight/2);
               texcoords.push(u1, v2);

               positions.push(...polygonIdCenter, x2, -idHeight/2);
               texcoords.push(u2, v1);
            
               positions.push(...polygonIdCenter, x, -idHeight/2);
               texcoords.push(u1, v1);

               // triangle 2
               positions.push(...polygonIdCenter, x2, idHeight/2);
               texcoords.push(u2, v2);
            
               positions.push(...polygonIdCenter, x2, -idHeight/2);
               texcoords.push(u2, v1);               
            
               positions.push(...polygonIdCenter, x, idHeight/2);
               texcoords.push(u1, v2);

               x += glyphInfo.width*scale;
            } 
         }
      }
      const positionData = new Float32Array(positions);
      const texcoordData = new Float32Array(texcoords);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.faceIdsBuffer.position);
      gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.faceIdsBuffer.texcoord);
      gl.bufferData(gl.ARRAY_BUFFER, texcoordData, gl.STATIC_DRAW);
   }

   // Obtiene un arreglo general con los colores de cada vértice de los triángulos que conforman el cpuModel. 
   // Si están seleccionados, marca el triángulo de un color distinto.
   get colorMatrix() {
      const polygons = this.cpuModel.polygons;
      const colorData = new Float32Array(this.trianglesCount*9);
   
      let j = 0;
      for (const polygon of polygons) {
         for (let i = 0; i < polygon.trianglesCount; i++) {
            let color;
            if (polygon.isSelected) 
               color = colorConfig.selectedColor;
            else 
               color = colorConfig.baseColor;

            colorData[j] = color[0]; colorData[j+1] = color[1]; colorData[j+2] = color[2];
            colorData[j+3] = color[0]; colorData[j+4] = color[1]; colorData[j+5] = color[2];
            colorData[j+6] = color[0]; colorData[j+7] = color[1]; colorData[j+8] = color[2];

            j += 9;
         }
      }
      return new Float32Array(colorData);
   }
}