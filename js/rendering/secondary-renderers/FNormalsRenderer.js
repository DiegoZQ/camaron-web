"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class FNormalsRenderer extends SecondaryRenderer {
	constructor(mvpManager, model) {
		super(
			mvpManager, 
			sCVertexShader,
			sCFragmentShader, 
			model.faceNormalsLinesBuffer,
        	colorConfig.faceNormalColor, 
			gl.LINES, 
			model.polygons.length*2
		);
	}
}