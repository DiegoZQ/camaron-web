var WireRenderer = function(rModel){
	Renderer.call(this, rModel);
	this.program = webglUtils.createProgramFromSources(gl, [basicVertexShader, basicFragmentShader]);
}

WireRenderer.prototype = Object.create(Renderer.prototype);
WireRenderer.prototype.constructor = DirectVertexRenderer;

WireRenderer.prototype.init = function(){
	gl.useProgram(this.program);
	this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
	this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");
	this.colorLocation = gl.getUniformLocation(this.program, "u_color");
	
	this.positionBuffer = gl.createBuffer();
	this.normalBuffer = gl.createBuffer();
	this.vao = gl.createVertexArray();

	gl.bindVertexArray(this.vao);

	gl.enableVertexAttribArray(this.positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.rModel.getEdges(), gl.STATIC_DRAW);
	gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}

WireRenderer.prototype.draw = function(){
	gl.useProgram(this.program);
	gl.bindVertexArray(this.vao);
	gl.uniformMatrix4fv(this.MVPLocation, false, this.rModel.getMVP());
	gl.uniformMatrix4fv(this.modelLocation, false, this.rModel.getModelMatrix());
	gl.uniform4fv(this.colorLocation, vec4.fromValues(0, 0, 0, 1));

	gl.drawArrays(gl.LINES, 0, this.rModel.getEdgesCount()*2);
}