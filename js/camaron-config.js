var ColorConfig = function(){
	this.baseColor = vec4.fromValues(0.7, 0.7, 0.7, 1);
	this.selectedColor = vec4.fromValues(0.7, 0.1, 0.1, 1);
}

ColorConfig.prototype.getBaseColor = function(){
	return this.baseColor;
}

ColorConfig.prototype.getSelectedColor = function(){
	return this.selectedColor;
}