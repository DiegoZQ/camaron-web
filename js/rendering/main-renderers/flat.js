"use strict";

var FlatRenderer = function(rModel){
	Renderer.call(this, rModel);
	this.program = webglUtils.createProgramFromSources(gl, [basicVertexShader, basicFragmentShader]);
}

FlatRenderer.prototype = Object.create(Renderer.prototype);
FlatRenderer.prototype.constructor = FlatRenderer;

FlatRenderer.prototype.init = function(){
	gl.useProgram(this.program);
	this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
	this.colorAttributeLocation = gl.getAttribLocation(this.program, "a_color");
	this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");
	
	this.positionBuffer = this.rModel.getTrianglesBuffer();
	this.colorBuffer = gl.createBuffer();
	this.vao = gl.createVertexArray();

	gl.bindVertexArray(this.vao);

	gl.enableVertexAttribArray(this.positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
	gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(this.colorAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.rModel.getColorMatrix(), gl.STATIC_DRAW);
	gl.vertexAttribPointer(this.colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}

FlatRenderer.prototype.draw = function(){
	gl.useProgram(this.program);
	gl.bindVertexArray(this.vao);
	gl.uniformMatrix4fv(this.MVPLocation, false, rModel.getMVP());

	gl.cullFace(gl.BACK);
	gl.drawArrays(gl.TRIANGLES, 0, rModel.getTrianglesCount()*3);

	gl.cullFace(gl.FRONT);
	gl.drawArrays(gl.TRIANGLES, 0, rModel.getTrianglesCount()*3);
}

FlatRenderer.prototype.updateColor = function(){
	gl.enableVertexAttribArray(this.colorAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.rModel.getColorMatrix(), gl.STATIC_DRAW);
	gl.vertexAttribPointer(this.colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}