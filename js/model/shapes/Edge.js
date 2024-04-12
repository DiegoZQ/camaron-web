"use strict";

// requires './Shape';
// requires '../external/gl-matrix';
// requires "../external/earcut";


class Edge extends Shape {
    constructor(id, startVertex, endVertex) {
        super(id);
        this.startVertex = startVertex;
        this.endVertex = endVertex; 
        this.adjacentEdges = []; 
    }
}