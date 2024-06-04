"use strict";


class AreaEvaluationStrategy extends EvaluationStrategy {
   constructor(model, mode) {
      super(model, mode);
  	}

   evaluate() {
      const data = {};
      const areaList = [];
      let minArea = Infinity;
      let maxArea = 0;

      const availableModelTypes = ['PolygonMesh', 'PolyhedronMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
      const polytopes = this.model.modelType === 'PolygonMesh' ? this.model.polygons : this.model.polyhedrons;
      for (const polytope of polytopes) {
         if ((this.mode === "selection" && !polytope.isSelected) || !polytope.isVisible) {
            continue;
         }
         // Obtiene el área de cada polítopo	
         const area = polytope.area;
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