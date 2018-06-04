var FlatRenderer = function(rModel){
	Renderer.call(this, rModel);
	this.program = webglUtils.createProgramFromSources(gl, [basicVertexShader, basicFragmentShader]);
}

FlatRenderer.prototype = Object.create(Renderer.prototype);
FlatRenderer.prototype.constructor = FlatRenderer;

FlatRenderer.prototype.init = function(){
	gl.useProgram(this.program);
	this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
	this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");
	this.colorLocation = gl.getUniformLocation(this.program, "u_color");
	this.positionBuffer = gl.createBuffer();
	this.vao = gl.createVertexArray();

	gl.bindVertexArray(this.vao);

	gl.enableVertexAttribArray(this.positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.rModel.getTriangles(), gl.STATIC_DRAW);
	gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}

FlatRenderer.prototype.draw = function(){
	gl.useProgram(this.program);
	gl.bindVertexArray(this.vao);
	gl.uniformMatrix4fv(this.MVPLocation, false, rModel.getMVP());
	gl.uniform4fv(this.colorLocation, rModel.getColor());

	gl.cullFace(gl.BACK);
	gl.drawArrays(gl.TRIANGLES, 0, rModel.getTrianglesCount()*3);

	gl.cullFace(gl.FRONT);
	gl.drawArrays(gl.TRIANGLES, 0, rModel.getTrianglesCount()*3);
}