"use strict";

import Renderer from "../Renderer";
import { basicVertexShader, basicFragmentShader } from "../shaders";

class FlatRenderer extends Renderer {
	constructor(rModel) {
	  super(rModel);
	  this.program = webglUtils.createProgramFromSources(gl, [basicVertexShader, basicFragmentShader]);
	  this.positionBuffer = null;
	  this.colorBuffer = null;
  
	  this.positionAttributeLocation = null;
	  this.colorAttributeLocation = null;
	  this.MVPLocation = null;
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.colorAttributeLocation = gl.getAttribLocation(this.program, "a_color");
		this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");

		// Obtiene la información de trianglesBuffer y crea el color buffer
		this.positionBuffer = this.rModel.trianglesBuffer;
		this.colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.rModel.colorMatrix, gl.STATIC_DRAW);

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
		gl.uniformMatrix4fv(this.MVPLocation, false, this.rModel.MVP);

		this.renderWithCulling();
	}

	updateColor() {
		// Modifica el valor del color buffer con información actualizada de la color matrix del RModel
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.rModel.colorMatrix, gl.STATIC_DRAW);

		// Asigna el valor del color buffer dentro de las variables a_color
		this.setupAttributePointer(this.colorAttributeLocation, this.colorBuffer);
	}
}

export default FlatRenderer;