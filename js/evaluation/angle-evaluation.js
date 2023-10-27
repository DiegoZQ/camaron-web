"use strict";

import EvaluationStrategy from './evaluation-base'
import { radToDeg } from '../helpers';


class AngleEvaluationStrategy extends EvaluationStrategy {
   constructor(model, mode) {
      super(model, mode);
   }

   evaluate() {
      const data = {};
      const angleList = [];
      let minAngle = 360;
    	let maxAngle = 0;

    	const polygons = this.model.getPolygons();
		// Itera sobre los polígonos del modelo
    	for (const polygon of polygons) {
    	   if (this.mode === "selection" && !polygon.isSelected()) 
    			continue;
			// Obtiene los ángulos de cada polígono	
    	   const polygonAngles = polygon.getAngles();

    	   for (const angleRad of polygonAngles) {
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