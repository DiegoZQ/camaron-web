"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class VNormalsRenderer extends SecondaryRenderer {
	constructor(mvpManager, model) {
		super(
			mvpManager, 
			sCVertexShader, 
			sCFragmentShader, 
			model.vertexNormalsLinesBuffer,
            colorConfig.vertexNormalColor,
			gl.LINES, 
			model.vertices.length*2
		);
	}
}