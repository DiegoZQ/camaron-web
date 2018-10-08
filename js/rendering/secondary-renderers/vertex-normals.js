var VNormalsRenderer = function(rModel){
	Renderer.call(this, rModel);
	this.program = webglUtils.createProgramFromSources(gl, [sCVertexShader, sCFragmentShader]);
}

VNormalsRenderer.prototype = Object.create(Renderer.prototype);
VNormalsRenderer.prototype.constructor = VNormalsRenderer;

VNormalsRenderer.prototype.init = function(){
	gl.useProgram(this.program);
	this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
	this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");
	this.colorLocation = gl.getUniformLocation(this.program, "u_color");
	
	this.positionBuffer = gl.createBuffer();
	this.vao = gl.createVertexArray();

	gl.bindVertexArray(this.vao);

	gl.enableVertexAttribArray(this.positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.rModel.getVertexNormalsLines(), gl.STATIC_DRAW);
	gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}

VNormalsRenderer.prototype.draw = function(){
	gl.useProgram(this.program);
	gl.bindVertexArray(this.vao);
	gl.uniformMatrix4fv(this.MVPLocation, false, this.rModel.getMVP());
	gl.uniformMatrix4fv(this.modelLocation, false, this.rModel.getModelMatrix());
	gl.uniform4fv(this.colorLocation, colorConfig.getVertexNormalsColor());

	gl.drawArrays(gl.LINES, 0, this.rModel.getVerticesCount()*2);
}