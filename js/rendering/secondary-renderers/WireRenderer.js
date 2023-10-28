"use strict";

import SecondaryRenderer from "./SecondaryRenderer";
import { sCVertexShader, sCFragmentShader } from "../shaders";


class WireRenderer extends SecondaryRenderer {
	constructor(GPUModel) {
		super(GPUModel, sCVertexShader, sCFragmentShader, this.GPUModel.edgesBuffer, 
            colorConfig.getWireFrameColor(), gl.LINES, this.GPUModel.edgesCount*2);
	}
}

export default WireRenderer;