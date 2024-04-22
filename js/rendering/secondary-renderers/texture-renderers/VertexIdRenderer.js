"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";


class VertexIdRenderer extends BillboardIdRenderer {
	constructor(gpuModel) {
		super(
			gpuModel, 
			gpuModel.vertexIdsBuffer.position, 
			gpuModel.vertexIdsBuffer.texcoord, 
			colorConfig.vertexCloudColor, 
			gpuModel.vertexIdsLength
		)
	}
}