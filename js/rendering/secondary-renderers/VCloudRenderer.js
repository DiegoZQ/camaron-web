"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class VCloudRenderer extends SecondaryRenderer {
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
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.colorAttributeLocation = gl.getUniformLocation(this.program, "u_color");
		this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");
		const typeAttributeLocation = gl.getAttribLocation(this.program, "vType");

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		if (this.holes) {
			const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
			this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer, 3, stride, 0);
			this.setupAttributePointer(typeAttributeLocation, this.positionBuffer, 1, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
			this.loadTexture();
		} else {
			// Asigna el valor del positionBuffer dentro de las variable a_position del shader
			this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer);
			gl.vertexAttrib1f(typeAttributeLocation, 0.0);
		}
	}

	loadTexture() {
		const icon = document.getElementById('icon');
		const glTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, icon);
		gl.generateMipmap(gl.TEXTURE_2D);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		const spriteTextureAttributeLocation = gl.getUniformLocation(this.program, 'spriteTexture');
		gl.uniform1i(spriteTextureAttributeLocation, 0);
	}
}