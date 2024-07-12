"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";


class FaceIdRenderer extends BillboardIdRenderer {
	constructor(mvpManager, model) {
		super(
			mvpManager,
			model, 
			model.faceIdsBuffer.position, 
			model.faceIdsBuffer.texcoord, 
			colorConfig.faceIdColor, 
			model.polygonIdsLength
		)
	}
}