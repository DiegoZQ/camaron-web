"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";


class BillboardIdRenderer extends TextureRenderer {
	constructor(gpuModel, positionBuffer, texcoordBuffer, color, billboardLength) {
		super(
			gpuModel,
			billboardVertexShader, 
			billboardFragmentShader,
			positionBuffer, 
        	color, 
			gl.TRIANGLES, 
			billboardLength*6,
		);
		this.texcoordBuffer = texcoordBuffer;
		this.centerAttributeLocation = null;
		this.texcoordAttributeLocation = null;
		this.VLocation = null;
        this.PLocation = null;
        this.MVLocation = null;
	}

	init() {
		gl.useProgram(this.program);

		// Obtiene las posiciones de las variables en el shader
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
		this.centerAttributeLocation = gl.getAttribLocation(this.program, "a_center");
        this.texcoordAttributeLocation = gl.getAttribLocation(this.program, "a_texcoord");

		this.VLocation = gl.getUniformLocation(this.program, "u_view");
		this.PLocation = gl.getUniformLocation(this.program, "u_projection");
		this.MVLocation = gl.getUniformLocation(this.program, "u_worldView");

		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		const stride = 5*Float32Array.BYTES_PER_ELEMENT;
		// Asigna el valor del positionBuffer dentro de las variable a_position del shader
        this.setupAttributePointer(this.centerAttributeLocation, this.positionBuffer, 3, stride, 0);
		this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer, 2, stride, 3*Float32Array.BYTES_PER_ELEMENT);

        this.setupAttributePointer(this.texcoordAttributeLocation, this.texcoordBuffer, 2);
        this.loadTexture();		
	}

	loadTexture() {        
        super.loadTexture('alfa', 0);	
    }

	draw() {
		gl.useProgram(this.program);
        
		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		gl.uniformMatrix4fv(this.VLocation, false, this.gpuModel.MVPManager.viewMatrix);
        gl.uniformMatrix4fv(this.PLocation, false, this.gpuModel.MVPManager.projectionMatrix);
        gl.uniformMatrix4fv(this.MVLocation, false, this.gpuModel.MVPManager.MV);
		
		gl.cullFace(gl.FRONT);
		gl.drawArrays(this.drawingPrimitive, 0, this.numPrimitives);		
	}
}