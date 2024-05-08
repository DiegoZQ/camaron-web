"use strict";

// requires "./MainRenderer";
// requires "../shaders";


class CuttingPlaneRenderer extends MainRenderer {
	constructor(mvpManager, model) {
	  super(mvpManager, model, cuttingPlaneVertexShader, cuttingPlaneFragmentShader);
      this.translation = [0,0,0];
      this.translationLocation = null;
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.translationLocation = gl.getUniformLocation(this.program, "u_translation");
		this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		// Asigna los valores de los buffers dentro de las variables del shader
		this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer);
	}

	draw() {
		gl.useProgram(this.program);

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		// Asigna los valores de MVP a la variable u_worldViewProjection del shader
        gl.uniform3fv(this.translationLocation, this.translation); 
		gl.uniformMatrix4fv(this.MVPLocation, false, this.mvpManager.MVP);

		this.renderWithCulling();
	}
}