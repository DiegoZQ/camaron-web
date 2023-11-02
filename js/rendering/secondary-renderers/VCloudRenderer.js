"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class VCloudRenderer extends SecondaryRenderer {
	constructor(gpuModel) {
	   super(gpuModel, pointVertexShader, pointFragmentShader, this.gpuModel.verticesBuffer, 
            colorConfig.vertexCloudColor, gl.POINTS, this.gpuModel.vertices.length);
	}
}