"use strict";

import SecondaryRenderer from "./SecondaryRenderer";
import { pointVertexShader, pointFragmentShader } from "../shaders";


class VCloudRenderer extends SecondaryRenderer {
	constructor(GPUModel) {
	   super(GPUModel, pointVertexShader, pointFragmentShader, this.GPUModel.verticesBuffer, 
            colorConfig.getVertexCloudColor(), gl.POINTS, this.GPUModel.vertices.length);
	}
}

export default VCloudRenderer