var DirectVertexRenderer = function(rModel){
	Renderer.call(this, rModel);
	this.program = webglUtils.createProgramFromSources(gl, [normalVertexShader, normalFragmentShader]);
}

DirectVertexRenderer.prototype = Object.create(Renderer.prototype);
DirectVertexRenderer.prototype.constructor = DirectVertexRenderer;

DirectVertexRenderer.prototype.init = function(){
	gl.useProgram(this.program);
	this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
	this.normalAttributeLocation = gl.getAttribLocation(this.program, "a_normal");
	this.MVPLocation = gl.getUniformLocation(this.program, "u_worldViewProjection");
	this.modelLocation = gl.getUniformLocation(this.program, "u_world");
	this.colorLocation = gl.getUniformLocation(this.program, "u_color");
	this.reverseLightDirectionLocation = gl.getUniformLocation(this.program, "u_reverseLightDirection");
	
	this.positionBuffer = gl.createBuffer();
	this.normalBuffer = gl.createBuffer();
	this.vao = gl.createVertexArray();

	gl.bindVertexArray(this.vao);

	gl.enableVertexAttribArray(this.positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.rModel.getTriangles(), gl.STATIC_DRAW);
	gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(this.normalAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.rModel.getVerticesNormals(), gl.STATIC_DRAW);
	gl.vertexAttribPointer(this.normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}

DirectVertexRenderer.prototype.draw = function(){
	gl.useProgram(this.program);
	gl.bindVertexArray(this.vao);
	var lightDirection = vec3.fromValues(0.5, 0.7, 1);
	var lightDirection = vec3.normalize(lightDirection, lightDirection);

	gl.uniformMatrix4fv(this.MVPLocation, false, this.rModel.getMVP());
	gl.uniformMatrix4fv(this.modelLocation, false, this.rModel.getModelMatrix());
	gl.uniform4fv(this.colorLocation, this.rModel.getColor());
	
	gl.cullFace(gl.BACK);
	gl.uniform3fv(this.reverseLightDirectionLocation, lightDirection);
	gl.drawArrays(gl.TRIANGLES, 0, this.rModel.getTrianglesCount()*3);

	gl.cullFace(gl.FRONT);
	gl.uniform3fv(this.reverseLightDirectionLocation, vec3.negate(lightDirection, lightDirection));
	gl.drawArrays(gl.TRIANGLES, 0, this.rModel.getTrianglesCount()*3);
}