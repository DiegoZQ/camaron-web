var AngleSelectionStrategy = function(model, mode, minAngle, maxAngle){
	SelectionStrategy.call(this, model, mode);
	this.minAngle = minAngle;
	this.maxAngle = maxAngle;
}

AngleSelectionStrategy.prototype = Object.create(SelectionStrategy.prototype);
AngleSelectionStrategy.prototype.constructor = AngleSelectionStrategy;

AngleSelectionStrategy.prototype.selectElement = function(polygon){
	
}