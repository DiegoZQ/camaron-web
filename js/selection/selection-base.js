var SelectionStrategy = function(model){
	this.model = model;
}

SelectionStrategy.prototype.selectElement = function(element){
	alert("This should be implemented by specific strategies.")
}

SelectionStrategy.prototype.clean = function(){
 	var polygonsCount = this.model.getPolygonsCount();
  var polygons = this.model.getPolygons();
  var polygon;
  var polygonVerticesCount;
  
  for(var i = 0; i < polygonsCount; i++){
    polygon = polygons[i];
    polygon.setSelected(false);  
  }
}

SelectionStrategy.prototype.select = function(){
	this.clean();
	var polygonsCount = this.model.getPolygonsCount();
  var polygons = this.model.getPolygons();
  var polygon;
  var polygonVerticesCount;
  
  for(var i = 0; i < polygonsCount; i++){
  	polygon = polygons[i];
    this.selectElement(polygon);
  }
}

SelectionStrategy.prototype.intersect = function(){
	var polygonsCount = this.model.getPolygonsCount();
  var polygons = this.model.getPolygons();
  var polygon;
  var polygonVerticesCount;
  
  for(var i = 0; i < polygonsCount; i++){
  	polygon = polygons[i];
  	if(polygon.isSelected()){
  		this.selectElement(polygon);
  	}
  }
}

SelectionStrategy.prototype.join = function(){
	var polygonsCount = this.model.getPolygonsCount();
  var polygons = this.model.getPolygons();
  var polygon;
  var polygonVerticesCount;
  
  for(var i = 0; i < polygonsCount; i++){
  	polygon = polygons[i];
  	if(!polygon.isSelected()){
  		this.selectElement(polygon);
  	}
  }
}

SelectionStrategy.prototype.substract = function(){
	var polygonsCount = this.model.getPolygonsCount();
  var polygons = this.model.getPolygons();
  var polygon;
  var polygonVerticesCount;
  
  for(var i = 0; i < polygonsCount; i++){
  	polygon = polygons[i];
  	if(polygon.isSelected()){
  		this.selectElement(polygon)
  		polygon.setSelected(!polygon.isSelected());
  	}
  }
}

