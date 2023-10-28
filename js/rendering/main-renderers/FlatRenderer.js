"use strict";

import MainRenderer from "./MainRenderer";
import { basicVertexShader, basicFragmentShader } from "../shaders";


class FlatRenderer extends MainRenderer {
	constructor(GPUModel) {
	  super(GPUModel, basicVertexShader, basicFragmentShader);
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.colorAttributeLocation = gl.getAttribLocation(this.program, "a_color");
		this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		// Asigna los valores de los buffers dentro de las variables del shader
		this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer);
		this.setupAttributePointer(this.colorAttributeLocation, this.colorBuffer);
	}

	draw() {
		gl.useProgram(this.program);

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		// Asigna los valores de MVP a la variable u_worldViewProjection del shader
		gl.uniformMatrix4fv(this.MVPLocation, false, this.GPUModel.MVP);

		this.renderWithCulling();
	}
}

export default FlatRenderer;