"use strict";


class VertexCloud extends AbstractModel {
    constructor() {
        super();
        this.modelType = 'VertexCloud';
        this.vertices = [];
        this.verticesBuffer = gl.createBuffer();
        this.vertexIdsBuffer = {position: gl.createBuffer(), texcoord: gl.createBuffer()};
        this.vertexIdsLength = 0;
    }

    get availableRenderers() {
        return [
            'none_renderer', 
            'vertex_cloud_renderer', 
            'vertex_id_renderer'
        ] 
    }
  
    get activeRenderers() {
        return [
            'none_renderer',
            'vertex_cloud_renderer'
        ]
    }

    loadBuffers() {
        this.loadVertices();
        this.loadVertexIds();
        this.loaded = true;
    }

    // Por cada vértice del modelo, obtiene sus coordenadas y las almacena en un arreglo global.
    // Sirve para representar nubes de puntos.
    loadVertices() {
        const vertices = this.vertices;
        const vertexData = new Float32Array(vertices.length*3);
        for (let i = 0; i < vertices.length; i++) {
            const j = i*3;
            const vertex = vertices[i].coords;
      
            vertexData[j] = vertex[0]; vertexData[j+1] = vertex[1]; vertexData[j+2] = vertex[2];
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
    }

    get fontScale() {
        const values = [this.modelWidth, this.modelHeight, this.modelDepth];
        const minValue = Math.min(...values);
        const minValueIndex = values.indexOf(minValue);
        let maxArea = 1;

        for (let i = 0; i < values.length; i++) {
            if (i != minValueIndex) {
                maxArea *= values[i];
            }
        }
        return (Math.sqrt(maxArea/this.vertices.length)/fontInfo.letterHeight) * 0.1; 
    }

    loadVertexIds() {
        const vertices = this.vertices;
        const positions = [];
        const texcoords = [];
  
        const maxX = fontInfo.textureWidth;
        const maxY = fontInfo.textureHeight;
        const scale = this.fontScale; 
  
        for (const vertex of vertices) {
            const id = `${vertex.id}`;
            this.vertexIdsLength += id.length;
            const idWidth = id.length*(fontInfo.letterWidth)*scale;
            const idHeight = fontInfo.letterHeight*scale;
            const vertexIdCenter = vertex.coords;
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
  
                    x += fontInfo.letterWidth*scale;
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
}