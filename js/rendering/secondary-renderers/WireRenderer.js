"use strict";

import Renderer from "../Renderer";
import { sCVertexShader, sCFragmentShader } from "../shaders";


class WireRenderer extends Renderer {
	constructor(GPUModel) {
		super(GPUModel, sCVertexShader, sCFragmentShader);
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.colorAttributeLocation = gl.getUniformLocation(this.program, "u_color");
		this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");

		// Obtiene la información de edgesBuffer 
		this.positionBuffer = this.GPUModel.edgesBuffer;

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		// Asigna el valor del positionBuffer dentro de las variable a_position del shader
		this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer);
	}

	draw() {
		gl.useProgram(this.program);

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		// Asigna los valores de MVP y colorConfig a las variables u_worldViewProjection y u_color del shader
		gl.uniformMatrix4fv(this.MVPLocation, false, this.GPUModel.MVP);
		gl.uniform4fv(this.colorAttributeLocation, colorConfig.getWireFrameColor());

		gl.drawArrays(gl.LINES, 0, this.GPUModel.edgesCount*2);
	}
}

export default WireRenderer;