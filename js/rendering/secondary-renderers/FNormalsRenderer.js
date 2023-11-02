"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class FNormalsRenderer extends SecondaryRenderer {
	constructor(gpuModel) {
	   super(gpuModel, sCVertexShader, sCFragmentShader, this.gpuModel.faceNormalsLinesBuffer,
            colorConfig.faceNormalColor, gl.LINES, this.gpuModel.polygons.length*2);
	}
}