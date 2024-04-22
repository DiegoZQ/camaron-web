"use strict";

// requires "./CPUModel";


class VertexCloud extends CPUModel {
    constructor() {
        super();
        this.modelType = 'VertexCloud';
        this.vertices = [];
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
}