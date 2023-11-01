"use strict";

import SecondaryRenderer from "./SecondaryRenderer";
import { sCVertexShader, sCFragmentShader } from "../shaders";
import { colorConfig } from "../../camaron/camaron-config";


class WireRenderer extends SecondaryRenderer {
	constructor(GPUModel) {
		super(GPUModel, sCVertexShader, sCFragmentShader, this.GPUModel.edgesBuffer, 
            colorConfig.wireFrameColor, gl.LINES, this.GPUModel.edgesCount*2);
	}
}

export default WireRenderer;