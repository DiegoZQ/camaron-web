"use strict";

import Renderer from "../Renderer";


class DirectFaceRenderer extends Renderer {
	constructor(rModel, normalVertexShader, normalFragmentShader) {
	  super(rModel);
	  this.program = webglUtils.createProgramFromSources(gl, [normalVertexShader, normalFragmentShader]);
	  this.positionBuffer = null;
	  this.normalBuffer = null;
	  this.colorBuffer = null;
  
	  this.positionAttributeLocation = null;
	  this.normalAttributeLocation = null;
	  this.colorAttributeLocation = null;
	  this.MVPLocation = null;
	  this.modelLocation = null;
	  this.reverseLightDirectionLocation = null;
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.normalAttributeLocation = gl.getAttribLocation(this.program, "a_normal");
		this.colorAttributeLocation = gl.getAttribLocation(this.program, "a_color");
		this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");
		this.modelLocation = gl.getUniformLocation(this.program, "u_world");
		this.reverseLightDirectionLocation = gl.getUniformLocation(this.program, "u_reverseLightDirection");

		// Obtiene la información de los buffers de trianglesBuffer y trianglesNormalsBuffer y crea el color buffer
		this.positionBuffer = this.rModel.trianglesBuffer;
		this.normalBuffer = this.rModel.trianglesNormalsBuffer;
		this.colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.rModel.colorMatrix, gl.STATIC_DRAW);

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);
		
		// Asigna los valores de los buffers dentro de las variables del shader
		this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer);
		this.setupAttributePointer(this.normalAttributeLocation, this.normalBuffer);
		this.setupAttributePointer(this.colorAttributeLocation, this.colorBuffer);
	}

	draw() {
		gl.useProgram(this.program);

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		// Asigna los valores de MVP y modelMatrix a las variables u_worldViewProjection y u_world del shader
		gl.uniformMatrix4fv(this.MVPLocation, false, this.rModel.MVP);
		gl.uniformMatrix4fv(this.modelLocation, false, this.rModel.modelMatrix);

		const lightDirection = vec3.normalize(vec3.fromValues(0.5, 0.7, 1), vec3.fromValues(0.5, 0.7, 1));
		this.renderWithCulling(this.reverseLightDirectionLocation, lightDirection);
	}

	updateColor() {
		// Modifica el valor del color buffer con información actualizada de la color matrix del RModel
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.rModel.colorMatrix, gl.STATIC_DRAW);

		// Asigna el valor del color buffer dentro de las variables a_color
		this.setupAttributePointer(this.colorAttributeLocation, this.colorBuffer);
	}
}

export default DirectFaceRenderer