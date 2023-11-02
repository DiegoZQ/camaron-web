"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class VNormalsRenderer extends SecondaryRenderer {
	constructor(gpuModel) {
		super(gpuModel, sCVertexShader, sCFragmentShader, this.gpuModel.vertexNormalsLinesBuffer,
            colorConfig.vertexNormalColor, gl.LINES, this.gpuModel.vertices.length*2);
	}
}