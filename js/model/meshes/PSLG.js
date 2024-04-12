"use strict";

// requires "./CPUModel";

class PSLG extends VertexCloud {
    constructor() {
        super();
        this.modelType = 'PSLG';
        this.edges = null;
        this.holes = null;
    }
}