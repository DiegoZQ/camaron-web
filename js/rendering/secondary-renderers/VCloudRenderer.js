"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class VCloudRenderer extends SecondaryRenderer {
	constructor(gpuModel) {
	   super(gpuModel, pointVertexShader, pointFragmentShader, gpuModel.verticesBuffer, 
            colorConfig.vertexCloudColor, gl.POINTS, gpuModel.cpuModel.vertices.length);
	}
}