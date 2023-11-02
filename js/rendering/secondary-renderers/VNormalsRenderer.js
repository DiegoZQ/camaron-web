"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class VNormalsRenderer extends SecondaryRenderer {
	constructor(gpuModel) {
		super(gpuModel, sCVertexShader, sCFragmentShader, gpuModel.vertexNormalsLinesBuffer,
            colorConfig.vertexNormalColor, gl.LINES, gpuModel.cpuModel.vertices.length*2);
	}
}