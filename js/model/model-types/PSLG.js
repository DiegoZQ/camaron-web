"use strict";

// requires "./CPUModel";

class PSLG extends VertexCloud {
    constructor() {
        super();
        this.modelType = 'PSLG';
        this.edges = [];
        this.holes = [];
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
}