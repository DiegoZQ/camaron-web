"use strict";

import Renderer from "../Renderer";


class SecondaryRenderer extends Renderer {
	constructor(GPUModel, vertexShader, fragmentShader, positionBuffer, color, drawingPrimitive, numVertices) {
	   super(GPUModel, vertexShader, fragmentShader);
       this.positionBuffer = positionBuffer;
       this.color = color;
       this.drawingPrimitive = drawingPrimitive;
       this.numVertices = numVertices
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.colorAttributeLocation = gl.getUniformLocation(this.program, "u_color");
		this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");
		
		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		// Asigna el valor del positionBuffer dentro de las variable a_position del shader
		this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer);
	}

	draw() {
		gl.useProgram(this.program);

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		// Asigna los valores de MVP y color a las variables u_worldViewProjection y u_color del shader
		gl.uniformMatrix4fv(this.MVPLocation, false, this.GPUModel.MVP);
		gl.uniform4fv(this.colorAttributeLocation, this.color);

		gl.drawArrays(drawingPrimitive, 0, numVertices);
	}
}

export default SecondaryRenderer