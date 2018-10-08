var AreaEvaluationStrategy = function(model, mode){
	EvaluationStrategy.call(this, model, mode);
}

AreaEvaluationStrategy.prototype = Object.create(EvaluationStrategy.prototype);
AreaEvaluationStrategy.prototype.constructor = AreaEvaluationStrategy;

AreaEvaluationStrategy.prototype.evaluate = function(element){
	var data = {};
	var area_list = [];
	var min_area = 1000000;
	var max_area = 0;

	var polygonsCount = this.model.getPolygonsCount();
  var polygons = this.model.getPolygons();
  var polygon;
  var area;
  
  for(var i = 0; i < polygonsCount; i++){
  	polygon = polygons[i];
  	if(this.mode == "selection" && !polygon.isSelected()){
  		continue;
  	}
    area = polygon.getArea();
    area_list.push(area);

    if(area > max_area){
    	max_area = area;
    }else if(area < min_area){
    	min_area = area;
    }
  }

  data["title"] = 'Area Histogram';
  data["x_axis"] = 'Area';
  data["list"] = area_list;
  data["min"] = min_area;
  data["max"] = max_area;

  return data;
}
