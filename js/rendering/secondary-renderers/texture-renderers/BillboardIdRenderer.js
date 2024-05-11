"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";


class BillboardIdRenderer extends TextureRenderer {
	constructor(mvpManager, model, positionBuffer, texcoordBuffer, color, billboardLength) {
		super(
			mvpManager,
			billboardVertexShader, 
			billboardFragmentShader,
			positionBuffer, 
        	color, 
			gl.TRIANGLES, 
			billboardLength*6,
		);
		this.fontScale = model.fontScale;
		//console.log(this.fontScale);
		this.texcoordBuffer = texcoordBuffer;
		this.centerAttributeLocation = null;
		this.texcoordAttributeLocation = null;
		this.fontScaleLocation = null;
		this.scaleLocation = null; // model scale
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

		this.colorAttributeLocation = gl.getUniformLocation(this.program, "u_color");
		this.fontScaleLocation = gl.getUniformLocation(this.program, "font_scale");
		this.scaleLocation = gl.getUniformLocation(this.program, "scale");
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
        super.loadTexture('numbers', 0);	
    }

	draw() {
		gl.useProgram(this.program);
        
		// Inicializa el Vertex Array Object (VAO)
		gl.bindVertexArray(this.vao);

		gl.uniform4fv(this.colorAttributeLocation, this.color);
		gl.uniform1f(this.fontScaleLocation, this.fontScale);
		gl.uniform1f(this.scaleLocation, this.mvpManager._scale[0]); 
		gl.uniformMatrix4fv(this.VLocation, false, this.mvpManager.viewMatrix);
        gl.uniformMatrix4fv(this.PLocation, false, this.mvpManager.projectionMatrix);
        gl.uniformMatrix4fv(this.MVLocation, false, this.mvpManager.MV);
		
		gl.cullFace(gl.FRONT);
		gl.drawArrays(this.drawingPrimitive, 0, this.numPrimitives);		
	}
}