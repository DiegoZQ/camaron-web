"use strict";


class AngleEvaluationStrategy extends EvaluationStrategy {
	constructor(model, mode) {
      	super(model, mode);
   	}

   	evaluate() {
      	const data = {};
      	const angleList = [];
      	let minAngle = Infinity;
    	let maxAngle = 0;

		const availableModelTypes = ['PolygonMesh', 'PolyhedronMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
		const polytopes = this.model.modelType === 'PolygonMesh' ? this.model.polygons : this.model.polyhedrons;
		for (const polytope of polytopes) {
			if ((this.mode === "selection" && !polytope.isSelected) || !polytope.isVisible) {
			 	continue;
		 	}
			const angles = this.model.modelType === 'PolygonMesh' ? polytope.angles : polytope.solidAngles;
			minAngle = Math.min(minAngle, ...angles);
			maxAngle = Math.max(maxAngle, ...angles);
			angleList.push(...angles);
		}
	 	data.title = 'Angles Histogram';
	 	data.x_axis = this.model.modelType === 'PolygonMesh' ? 'Angles (radian)' : 'Angles (steradian)';
      	data.list = angleList;
      	data.min = minAngle;
      	data.max = maxAngle;

    	return data;
  	}
}