"use strict";

import SecondaryRenderer from "./SecondaryRenderer";
import { pointVertexShader, pointFragmentShader } from "../shaders";
import { colorConfig } from "../../camaron/camaron-config";


class VCloudRenderer extends SecondaryRenderer {
	constructor(GPUModel) {
	   super(GPUModel, pointVertexShader, pointFragmentShader, this.GPUModel.verticesBuffer, 
            colorConfig.vertexCloudColor, gl.POINTS, this.GPUModel.vertices.length);
	}
}

export default VCloudRenderer