"use strict";


class PSLG extends VertexCloud {
    constructor() {
        super();
        this.modelType = 'PSLG';
        this.holes = [];
        this.edges = [];
        this.edgesBuffer = gl.createBuffer();
        this.edgesCount = 0;
    }

    get availableRenderers() {
        return [
            'none_renderer', 
            'wireframe_renderer', 
            'vertex_cloud_renderer', 
            'vertex_id_renderer'
         ] 
    }
  
    get activeRenderers() {
        return [
            'none_renderer',
            'wireframe_renderer'
        ]
    }

    loadBuffers() {
        this.loadVertices();
        this.loadVertexIds();
        this.loadEdges();
        this.loaded = true;
    }

    loadVertices() {
        const vertices = this.vertices;
        const holes = this.holes;

        if (!holes.length) {
            super.loadVertices();
        } else {
            const vertexData = new Float32Array(4*(vertices.length + holes.length));
            // load vertices
            for (let i = 0; i < vertices.length; i++) {
                const j = i*4;
                const vertex = vertices[i].coords;
            
                vertexData[j] = vertex[0]; vertexData[j+1] = vertex[1]; vertexData[j+2] = vertex[2];
                vertexData[j+3] = 0.0;
            }
            // load holes
            for (let i = 0; i < holes.length; i++) {
                const j = 4*vertices.length + i*4;
                const hole = holes[i].coords;
            
                vertexData[j] = hole[0]; vertexData[j+1] = hole[1]; vertexData[j+2] = hole[2];
                vertexData[j+3] = 1.0;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        }
    }  

    loadEdges() {
        const edges = this.edges;
        this.edgesCount = edges.length; 
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
}