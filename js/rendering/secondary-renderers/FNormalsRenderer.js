"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class FNormalsRenderer extends SecondaryRenderer {
	constructor(gpuModel) {
	   super(gpuModel, sCVertexShader, sCFragmentShader, gpuModel.faceNormalsLinesBuffer,
            colorConfig.faceNormalColor, gl.LINES, gpuModel.cpuModel.polygons.length*2);
	}
}