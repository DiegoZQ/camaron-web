"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class WireRenderer extends SecondaryRenderer {
	constructor(mvpManager, model) {
		super(
			mvpManager, 
			sCVertexShader, 
			sCFragmentShader, 
			model.edgesBuffer, 
            colorConfig.wireFrameColor, 
			gl.LINES, 
			model.edgesCount*2
		);
	}
}