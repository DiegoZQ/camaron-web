"use strict";

// requires "../Renderer";


class SecondaryRenderer extends Renderer {
	constructor(mvpManager, vertexShader, fragmentShader, positionBuffer, color, drawingPrimitive, numPrimitives) {
	   super(mvpManager, vertexShader, fragmentShader);
       this.positionBuffer = positionBuffer;
       this.color = color;
       this.drawingPrimitive = drawingPrimitive;
       this.numPrimitives = numPrimitives
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
		gl.uniformMatrix4fv(this.MVPLocation, false, this.mvpManager.MVP);
		gl.uniform4fv(this.colorAttributeLocation, this.color);

		gl.drawArrays(this.drawingPrimitive, 0, this.numPrimitives);
	}
}