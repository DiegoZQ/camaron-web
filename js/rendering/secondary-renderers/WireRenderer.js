"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class WireRenderer extends SecondaryRenderer {
	constructor(gpuModel) {
		super(gpuModel, sCVertexShader, sCFragmentShader, gpuModel.edgesBuffer, 
            colorConfig.wireFrameColor, gl.LINES, gpuModel.edgesCount*2);
	}
}