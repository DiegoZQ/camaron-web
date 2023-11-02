"use strict";

// requires './EvaluationStrategy'


class AreaEvaluationStrategy extends EvaluationStrategy {
   constructor(cpuModel, mode) {
      super(cpuModel, mode);
  	}

   evaluate() {
      const data = {};
      const areaList = [];
      let minArea = 1000000;
      let maxArea = 0;

      const polygons = this.cpuModel.polygons;
      // Itera sobre los polígonos del cpuModel
      for (const polygon of polygons) {
         if (this.mode === "selection" && !polygon.isSelected) 
            continue;
         // Obtiene el área de cada polígono	
         const area = polygon.area;
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