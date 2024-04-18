"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";


//class VertexIdRenderer extends SecondaryRenderer {
//	constructor(gpuModel) {
//		super(
//			gpuModel,
//			pointIdVertexShader, 
//			pointIdFragmentShader,
//			gpuModel.vertexIdsBuffer.position, 
//        	colorConfig.vertexCloudColor, 
//			gl.TRIANGLES, 
//			gpuModel.vertexIdsLength*6,
//		);
//		this.centerAttributeLocation = null;
//        this.texcoordBuffer = gpuModel.vertexIdsBuffer.texcoord;
//		this.texcoordAttributeLocation = null;
//		this.VPLocation = null;
//		this.VLocation = null;
//		this.VP = vec4.create();
//	}
//
//	init() {
//		gl.useProgram(this.program);
//
//		// Obtiene las posiciones de las variables en el shader
//		this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
//		this.centerAttributeLocation = gl.getAttribLocation(this.program, "a_center");
//        this.texcoordAttributeLocation = gl.getAttribLocation(this.program, "a_texcoord");
//		this.VPLocation = gl.getUniformLocation(this.program, "u_viewProjection");
//		this.VLocation = gl.getUniformLocation(this.program, "u_view");
//
//		// Inicializa el Vertex Array Object (VAO)
//		gl.bindVertexArray(this.vao);
//
//		const stride = 5*Float32Array.BYTES_PER_ELEMENT;
//
//		// Asigna el valor del positionBuffer dentro de las variable a_position del shader
//		console.log(this.positionAttributeLocation, this.centerAttributeLocation, this.texcoordAttributeLocation);
//		this.setupAttributePointer(this.positionAttributeLocation, this.positionBuffer, 2, stride, 3*Float32Array.BYTES_PER_ELEMENT);
//		this.setupAttributePointer(this.centerAttributeLocation, this.positionBuffer, 3, stride, 0);
//        this.setupAttributePointer(this.texcoordAttributeLocation, this.texcoordBuffer, 2);
//        this.loadTexture();		
//	}
//
//	loadTexture() {
//		const alfa = document.getElementById('alfa');
//        const textTex = gl.createTexture();
//        gl.bindTexture(gl.TEXTURE_2D, textTex);
//        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, alfa);
//        gl.generateMipmap(gl.TEXTURE_2D);
//
//		gl.enable(gl.BLEND);
//		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//
//		//const spriteTextureAttributeLocation = gl.getUniformLocation(this.program, 'spriteTexture');
//		//gl.uniform1i(spriteTextureAttributeLocation, 0);
//	}
//
//	draw() {
//		gl.useProgram(this.program);
//
//		// Inicializa el Vertex Array Object (VAO)
//		gl.bindVertexArray(this.vao);
//
//		// Asigna los valores de MVP y color a las variables u_worldViewProjection y u_color del shader	
//		mat4.multiply(this.VP, this.gpuModel.MVPManager.projectionMatrix, this.gpuModel.MVPManager.viewMatrix);
//		//console.log(this.gpuModel.MVPManager.viewMatrix);
//
//		gl.uniform4fv(this.VPLocation, this.VP);
//		gl.uniformMatrix4fv(this.VLocation, false, this.gpuModel.MVPManager.viewMatrix);
//		
//		//console.log(this.numPrimitives);
//
//		gl.drawArrays(this.drawingPrimitive, 0, this.numPrimitives);		
//
//	}
//}