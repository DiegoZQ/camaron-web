"use strict";

// requires "./CPUModel";

class PSLG extends VertexCloud {
    constructor() {
        super();
        this.modelType = 'PSLG';
        this.edges = [];
        this.holes = [];
    }
}