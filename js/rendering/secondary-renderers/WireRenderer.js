"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class WireRenderer extends SecondaryRenderer {
	constructor(gpuModel) {
		super(gpuModel, sCVertexShader, sCFragmentShader, this.gpuModel.edgesBuffer, 
            colorConfig.wireFrameColor, gl.LINES, this.gpuModel.edgesCount*2);
	}
}