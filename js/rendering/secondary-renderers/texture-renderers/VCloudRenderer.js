"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class VCloudRenderer extends TextureRenderer {
	constructor(gpuModel) {
		const numVertices = gpuModel.cpuModel.vertices.length;
		const numHoles = gpuModel.cpuModel.holes ? gpuModel.cpuModel.holes.length : 0;
		super(
			gpuModel,
			pointVertexShader, 
			pointFragmentShader,
			gpuModel.verticesBuffer, 
        	colorConfig.vertexCloudColor, 
			gl.POINTS, 
			numVertices + numHoles
		);
		this.holes = !!numHoles;
		this.typeAttributeLocation = null;
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.colorAttributeLocation = gl.getUniformLocation(this.program, "u_color");
		this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");
		this.typeAttributeLocation = gl.getAttribLocation(this.program, "vType");

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		if (this.holes) {
			const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
			this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer, 3, stride, 0);
			this.setupAttributePointer(this.typeAttributeLocation, this.positionBuffer, 1, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
			this.loadTexture();
		} else {
			// Asigna el valor del positionBuffer dentro de las variable a_position del shader
			this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer);
			gl.vertexAttrib1f(this.typeAttributeLocation, 0.0);
		}
	}

	loadTexture() {
		super.loadTexture('icon', 1);
	}
}