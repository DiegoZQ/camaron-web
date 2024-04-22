"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";


class FaceIdRenderer extends BillboardIdRenderer {
	constructor(gpuModel) {
		super(
			gpuModel, 
			gpuModel.faceIdsBuffer.position, 
			gpuModel.faceIdsBuffer.texcoord, 
			colorConfig.vertexCloudColor, 
			gpuModel.polygonIdsLength
		)
	}
}