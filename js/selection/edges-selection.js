"use strict";

var EdgesSelectionStrategy = function(model, mode, edgesNumber){
	SelectionStrategy.call(this, model, mode);
	this.edgesNumber = edgesNumber
}

EdgesSelectionStrategy.prototype = Object.create(SelectionStrategy.prototype);
EdgesSelectionStrategy.prototype.constructor = IdSelectionStrategy;

EdgesSelectionStrategy.prototype.selectElement = function(polygon){
	if(polygon.getVerticesCount() == this.edgesNumber){
		polygon.setSelected(true);
	}else{
		polygon.setSelected(false);
	}
	
}

EdgesSelectionStrategy.prototype.getText = function(){
	return "By Edges Number: " + this.edgesNumber;
}