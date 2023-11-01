"use strict";

import SecondaryRenderer from "./SecondaryRenderer";
import { sCVertexShader, sCFragmentShader } from "../shaders";
import { colorConfig } from "../../camaron/camaron-config";


class FNormalsRenderer extends SecondaryRenderer {
	constructor(GPUModel) {
	   super(GPUModel, sCVertexShader, sCFragmentShader, this.GPUModel.faceNormalsLinesBuffer,
            colorConfig.faceNormalColor, gl.LINES, this.GPUModel.polygons.length*2);
	}
}

export default FNormalsRenderer