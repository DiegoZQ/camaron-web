var ColorConfig = function(){
	this.baseColor = vec4.fromValues(0.7, 0.7, 0.7, 1);
	this.selectedColor = vec4.fromValues(0.7, 0.2, 0.2, 1);

	this.wireFrameColor = vec4.fromValues(0, 0, 0, 1);
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