"use strict";

// requires './EvaluationStrategy'
// requires '../helpers';


class AngleEvaluationStrategy extends EvaluationStrategy {
   constructor(model, mode) {
      super(model, mode);
   }

   evaluate() {
      const data = {};
      const angleList = [];
      let minAngle = 360;
    	let maxAngle = 0;

    	const polygons = this.model.polygons;
		// Itera sobre los polígonos del model
    	for (const polygon of polygons) {
    	   if (this.mode === "selection" && !polygon.isSelected) 
    			continue;
    	   for (const angleRad of polygon.angles) {
    	      const angleDeg = radToDeg(angleRad);
    	      angleList.push(angleDeg);
    	      minAngle = Math.min(minAngle, angleDeg);
    	      maxAngle = Math.max(maxAngle, angleDeg);
    	  	}
   	}
      data.title = 'Angles Histogram';
      data.x_axis = 'Angles (deg)';
      data.list = angleList;
      data.min = minAngle;
      data.max = maxAngle;

    	return data;
  	}
}