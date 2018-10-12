"use strict";

var AngleEvaluationStrategy = function(model, mode){
	EvaluationStrategy.call(this, model, mode);
}

AngleEvaluationStrategy.prototype = Object.create(EvaluationStrategy.prototype);
AngleEvaluationStrategy.prototype.constructor = AngleEvaluationStrategy;

AngleEvaluationStrategy.prototype.evaluate = function(element){
	var data = {};
	var angle_list = [];
	var min_angle = 360;
	var max_angle = 0;

	var polygonsCount = this.model.getPolygonsCount();
  	var polygons = this.model.getPolygons();
  	var polygon;
  	var angle;
  	var polygon_angles;

  
  	for(var i = 0; i < polygonsCount; i++){
  		polygon = polygons[i];
  		if(this.mode == "selection" && !polygon.isSelected()){
  			continue;
  		}
    	polygon_angles = polygon.getAngles();
    	for(var j=0; j < polygon_angles.length; j++){
    		angle = radToDeg(polygon_angles[j]);
    		angle_list.push(angle);
    		if(angle > max_angle){
    			max_angle = angle;
    		}else if(angle < min_angle){
    			min_angle = angle;
    		}
    	}
  	}

  	data["title"] = 'Angles Histogram';
  	data["x_axis"] = 'Angles(deg)';
  	data["list"] = angle_list;
  	data["min"] = min_angle;
  	data["max"] = max_angle;


  	return data;
}
