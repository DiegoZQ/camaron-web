"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";


class VertexIdRenderer extends BillboardIdRenderer {
	constructor(mvpManager, model) {
		super(
			mvpManager,
			model, 
			model.vertexIdsBuffer.position, 
			model.vertexIdsBuffer.texcoord, 
			colorConfig.vertexIdColor, 
			model.vertexIdsLength
		)
	}
}