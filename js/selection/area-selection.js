var AreaSelectionStrategy = function(model, mode, minArea, maxArea){
	SelectionStrategy.call(this, model, mode);
	this.minArea = minArea;
	this.maxArea = maxArea;
}

AreaSelectionStrategy.prototype = Object.create(SelectionStrategy.prototype);
AreaSelectionStrategy.prototype.constructor = AreaSelectionStrategy;

AreaSelectionStrategy.prototype.selectElement = function(polygon){
	var area = polygon.getArea();

	if(area >= this.minArea && area <= this.maxArea){
		polygon.setSelected(true);
	}else{
		polygon.setSelected(false);
	}
}

AreaSelectionStrategy.prototype.getText = function(){
	return "By Area: " + this.minArea + " - " + this.maxArea;
}
