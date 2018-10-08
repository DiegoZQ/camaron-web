var ColorConfig = function(){
	this.baseColor = vec4.fromValues(0.7, 0.7, 0.7, 1);
	this.selectedColor = vec4.fromValues(0.7, 0.2, 0.2, 1);

	this.wireFrameColor = vec4.fromValues(0, 0, 0, 1);
	this.vertexNormalColor = vec4.fromValues(1, 0, 0, 1);
	this.faceNormalColor = vec4.fromValues(0.145, 0.619, 0.109, 1);
	this.vertexCloudColor = vec4.fromValues(0, 0, 1, 1);
}

ColorConfig.prototype.getBaseColor = function(){
	return this.baseColor;
}

ColorConfig.prototype.getSelectedColor = function(){
	return this.selectedColor;
}

ColorConfig.prototype.getWireFrameColor = function(){
	return this.wireFrameColor;
}

ColorConfig.prototype.getVertexNormalsColor = function(){
	return this.vertexNormalColor;
}

ColorConfig.prototype.getFaceNormalsColor = function(){
	return this.faceNormalColor;
}

ColorConfig.prototype.getVertexCloudColor = function(){
	return this.vertexCloudColor;
}