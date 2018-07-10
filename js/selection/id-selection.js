var IdSelectionStrategy = function(model, mode, minId, maxId, idList){
	SelectionStrategy.call(this, model, mode);
	this.minId = minId;
	this.maxId = maxId;
	this.idList = idList;
}

IdSelectionStrategy.prototype = Object.create(SelectionStrategy.prototype);
IdSelectionStrategy.prototype.constructor = IdSelectionStrategy;

IdSelectionStrategy.prototype.selectElement = function(polygon){
	if(this.minId != null){
		if(polygon.getId() >= this.minId && polygon.getId() <= this.maxId){
			polygon.setSelected(true);
		}else{
			polygon.setSelected(false);
		}
	}else{
		if(idList.includes(polygon.getId())){
			polygon.setSelected(true);
		}
		else{
			polygon.setSelected(false);
		}
	}
}