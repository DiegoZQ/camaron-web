"use strict";

import EvaluationStrategy from './EvaluationStrategy'
import { radToDeg } from '../helpers';


class AngleEvaluationStrategy extends EvaluationStrategy {
   constructor(CPUModel, mode) {
      super(CPUModel, mode);
   }

   evaluate() {
      const data = {};
      const angleList = [];
      let minAngle = 360;
    	let maxAngle = 0;

    	const polygons = this.CPUModel.polygons;
		// Itera sobre los polígonos del modelo
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

export default AngleEvaluationStrategy;