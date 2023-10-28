"use strict";

import SecondaryRenderer from "./SecondaryRenderer";
import { sCVertexShader, sCFragmentShader } from "../shaders";


class FNormalsRenderer extends SecondaryRenderer {
	constructor(GPUModel) {
	   super(GPUModel, sCVertexShader, sCFragmentShader, this.GPUModel.faceNormalsLinesBuffer,
            colorConfig.getFaceNormalsColor(), gl.LINES, this.GPUModel.polygons.length*2);
	}
}

export default FNormalsRenderer