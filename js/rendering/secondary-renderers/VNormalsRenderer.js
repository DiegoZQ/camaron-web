"use strict";

import SecondaryRenderer from "./SecondaryRenderer";
import { sCVertexShader, sCFragmentShader } from "../shaders";


class VNormalsRenderer extends SecondaryRenderer {
	constructor(GPUModel) {
		super(GPUModel, sCVertexShader, sCFragmentShader, this.GPUModel.vertexNormalsLinesBuffer,
            colorConfig.getVertexNormalsColor(), gl.LINES, this.GPUModel.vertices.length*2);
	}
}

export default VNormalsRenderer