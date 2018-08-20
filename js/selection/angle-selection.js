var AngleSelectionStrategy = function(model, mode, minAngle, maxAngle){
	SelectionStrategy.call(this, model, mode);
	this.minAngle = minAngle;
	this.maxAngle = maxAngle;
}

AngleSelectionStrategy.prototype = Object.create(SelectionStrategy.prototype);
AngleSelectionStrategy.prototype.constructor = AngleSelectionStrategy;

AngleSelectionStrategy.prototype.selectElement = function(polygon){
	var angles = polygon.getAngles();
	for(var i = 0; i < angles.length; i++){
		var angle = radToDeg(angles[i]);
		if(angle >= this.minAngle && angle <= this.maxAngle){
			polygon.setSelected(true);
			break;
		}else{
			polygon.setSelected(false);
		}
	}
}