"use strict";


class PolygonMesh extends VertexCloud {
   constructor() {
      super();
      this.modelType = 'PolygonMesh';
      this.polygons = [];
      this.edgesBuffer = gl.createBuffer();
      this.trianglesBuffer = gl.createBuffer();
      this.verticesNormalsBuffer = gl.createBuffer();
      this.trianglesNormalsBuffer = gl.createBuffer();
      this.vertexNormalsLinesBuffer = gl.createBuffer();
      this.faceNormalsLinesBuffer = gl.createBuffer();
      this.faceIdsBuffer = {position: gl.createBuffer(), texcoord: gl.createBuffer()};
      this.edgesCount = 0;
      this.trianglesCount = 0;
      this.polygonIdsLength = 0;
   }

   get availableRenderers() {
      return [
         'face_renderer', 
         'vertex_renderer', 
         'flat_renderer', 
         'none_renderer', 
         'wireframe_renderer', 
         'vertex_cloud_renderer', 
         'face_normals_renderer', 
         'vertex_normals_renderer', 
         'face_id_renderer', 
         'vertex_id_renderer'
      ]
   }

   get activeRenderers() {
      return [
         'face_renderer'
      ]
   }

   loadBuffers() {
      this.loadVertices();
      this.loadVertexIds();
      this.loadEdges();
      this.loadTriangles();
      this.loadVertexNormals();
      this.loadTrianglesNormals();
      this.loadVertexNormalsLines();
      this.loadFaceNormalsLines();
      this.loadFaceIds();
      this.loaded = true;
   }

   // Por cada par de vértices consecutivos de cada polígono, agrega las dos coordenadas de ambos vértices 
   // para representar una "línea" entre ambos puntos. Este cálculo es necesario para representar el wireframe de un modelo.
   loadEdges() {
      const polygons = this.polygons;
      for (const polygon of polygons) {
         this.edgesCount += polygon.vertices.length
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

   // Por cada polígono del modelo, lo descompone en un conjunto de triángulos y agrega las coordenadas de dichos triángulos
   // en un arreglo global. Sirve para dibujar las caras del modelo.
   loadTriangles() {
      const polygons = this.polygons;
      let polygonTrianglesVertexCoords = [];
      for (const polygon of polygons) {
         polygonTrianglesVertexCoords = polygonTrianglesVertexCoords.concat(polygon.trianglesVertexCoords);
         this.trianglesCount += polygon.trianglesCount;
      }
      const triangleData = new Float32Array(polygonTrianglesVertexCoords);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, triangleData, gl.STATIC_DRAW);
   }

   // Por cada normal de cada vértice de cada triángulo de cada polígono, agrega dicha normal a un array global con todas las normales del modelo.
   // cada 3 valores corresponden a una normal de un vértice, y cada 3*n vértices (9*n valores) corresponden a un polígono de n triángulos.
   // Sirve para representar la iluminación sobre los vértices.
   loadVertexNormals() {
      const polygons = this.polygons;
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

   // Por cada vértice de cada triángulo de cada polígono, agrega la normal del polígono que comprende cada subconjunto de triángulos.
   // Sirve para representar la iluminación sobre las caras.
   loadTrianglesNormals() {
      const polygons = this.polygons;
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

   // Por cada vértice del modelo, obtiene sus coordenadas y su vector normal, suma la normal a cada vértice,
   // obteniendo así 2 puntos: el vértice y el vértice desplazado por la normal, que se agregan al arreglo global 
   // representando así una línea entre ambos puntos. Sirve para visualizar las normales de los vértices. 
   loadVertexNormalsLines() {
      const vertices = this.vertices;
      const vertexNormalLineData = new Float32Array(vertices.length*6);

      for (let i = 0; i < vertices.length; i++) {
         const j = i*6;
         const vertex = vertices[i].coords;
         const normal = vertices[i].normal;
     
         vec3.scale(normal, normal, this.modelHeight/50);
         vec3.add(normal, vertex, normal);
     
         vertexNormalLineData[j] = vertex[0]; vertexNormalLineData[j+1] = vertex[1]; vertexNormalLineData[j+2] = vertex[2];
         vertexNormalLineData[j+3] = normal[0]; vertexNormalLineData[j+4] = normal[1]; vertexNormalLineData[j+5] = normal[2];
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalsLinesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertexNormalLineData, gl.STATIC_DRAW);
   }

   // Por cada polígono del modelo, obtiene las coordenadas de su centro y su vector normal, suma la normal al centro,
   // obteniendo así 2 puntos: el centro y el centro desplazado por la normal, que se agregan al arreglo global 
   // representando así una línea entre ambos puntos. Sirve para visualizar las normales de las caras. 
   loadFaceNormalsLines() {
      const polygons = this.polygons;
      const faceNormalLineData = new Float32Array(polygons.length*6);

      for (let i = 0; i < polygons.length; i++) {
         const j = i*6;
         const normal = polygons[i].normal;
         const center = polygons[i].geometricCenter;
     
         vec3.scale(normal, normal, this.modelHeight/50);
         vec3.add(normal, center, normal);
     
         faceNormalLineData[j] = center[0]; faceNormalLineData[j+1] = center[1]; faceNormalLineData[j+2] = center[2];
         faceNormalLineData[j+3] = normal[0]; faceNormalLineData[j+4] = normal[1]; faceNormalLineData[j+5] = normal[2];
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.faceNormalsLinesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, faceNormalLineData, gl.STATIC_DRAW);
   }

   loadFaceIds() {
      const polygons = this.polygons;
      const positions = [];
      const texcoords = [];

      const maxX = fontInfo.textureWidth;
      const maxY = fontInfo.textureHeight;
      const scale = this.fontScale; 
      
      for (const polygon of polygons) {
         const id = `${polygon.id}`;
         this.polygonIdsLength += id.length;
         const idWidth = id.length*(fontInfo.letterWidth)*scale;
         const idHeight = fontInfo.letterHeight*scale;
         const polygonIdCenter = polygon.geometricCenter;
         let x = -idWidth/2;
         for (const number of id) {
            const glyphInfo = fontInfo.glyphInfos[number];
            if (glyphInfo) {
               const x2 = x + fontInfo.letterWidth*scale;
               const u1 = glyphInfo.x / maxX;
               const v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
               const u2 = (glyphInfo.x + fontInfo.letterWidth - 1) / maxX;
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

               x += fontInfo.letterWidth*scale;
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

   // Obtiene un arreglo general con los colores de cada vértice de los triángulos que conforman el modelo. 
   // Si están seleccionados, marca el triángulo de un color distinto.
   get colorMatrix() {
      const polygons = this.polygons;
      const colorData = new Float32Array(this.trianglesCount*12);
   
      let j = 0;
      for (const polygon of polygons) {
         for (let i = 0; i < polygon.trianglesCount; i++) {
            let color;
            if (polygon.isVisible && polygon.isSelected) {
               color = colorConfig.selectedColor;
            }
            else {
               color = colorConfig.baseColor;
               color[3] = hideUnselected === false && polygon.isVisible ? 1.0 : 0.0;
            } 
            colorData[j] = color[0]; colorData[j+1] = color[1]; colorData[j+2] = color[2]; colorData[j+3] = color[3];
            colorData[j+4] = color[0]; colorData[j+5] = color[1]; colorData[j+6] = color[2]; colorData[j+7] = color[3];
            colorData[j+8] = color[0]; colorData[j+9] = color[1]; colorData[j+10] = color[2]; colorData[j+11] = color[3];

            j += 12;
         }
      }
      return new Float32Array(colorData);
   }
}