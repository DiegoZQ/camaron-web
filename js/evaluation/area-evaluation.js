"use strict";

import EvaluationStrategy from './evaluation-base'


class AreaEvaluationStrategy extends EvaluationStrategy {
   constructor(model, mode) {
      super(model, mode);
  	}

   evaluate() {
      const data = {};
      const areaList = [];
      let minArea = 1000000;
      let maxArea = 0;

      const polygons = this.model.getPolygons();
      // Itera sobre los polígonos del modelo
      for (const polygon of polygons) {
         if (this.mode === "selection" && !polygon.isSelected()) 
            continue;
         // Obtiene el área de cada polígono	
         const area = polygon.getArea();
         areaList.push(area);

         maxArea = Math.max(maxArea, area);
         minArea = Math.min(minArea, area);
      }
      data.title = 'Area Histogram';
      data.x_axis = 'Area';
      data.list = areaList;
      data.min = minArea;
      data.max = maxArea;

      return data;
   }
}

export default AreaEvaluationStrategy;