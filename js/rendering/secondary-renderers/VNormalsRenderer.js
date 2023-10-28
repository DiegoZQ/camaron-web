"use strict";

import Renderer from "../Renderer";
import { sCVertexShader, sCFragmentShader } from "../shaders";


class VNormalsRenderer extends Renderer {
	constructor(GPUModel) {
		super(GPUModel, sCVertexShader, sCFragmentShader);
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.colorAttributeLocation = gl.getUniformLocation(this.program, "u_color");
		this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");

		// Obtiene la información de vertexNormalsLinesBuffer 
		this.positionBuffer = this.GPUModel.vertexNormalsLinesBuffer;

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
		gl.uniform4fv(this.colorAttributeLocation, colorConfig.getVertexNormalsColor());

		gl.drawArrays(gl.LINES, 0, this.GPUModel.vertices.length*2);
	}
}

export default VNormalsRenderer