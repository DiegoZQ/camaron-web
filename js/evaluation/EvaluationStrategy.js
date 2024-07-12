"use strict";


class EvaluationStrategy {
	constructor(model, mode) {
		if (model.modelType === 'PolygonMesh') {
			this.polytopes = model.polygons;
		} else if (model.modelType === 'PolyhedronMesh') {
			this.polytopes = model.polyhedrons;
		} else {
			this.polytopes = null;
		}
		this.model = model;
  		this.mode = mode;
	}

	// Evalúa el modelo utilizando una lista de tipos de modelos compatibles, 
	// una función de evaluación que toma un polítopo como parámetro,
	// así como un título y un nombre para el eje x para generar el histograma.
	evaluate(availableModelTypes, evaluationFun, title, xAxis) {
		const data = {};
		const valueList = [];
		let minValue = Infinity;
	  	let maxValue = 0;

	  	if (!availableModelTypes.includes(this.model.modelType)) {
			return;
	  	}
	  	for (const polytope of this.polytopes) {
		  	if ((this.mode === "selection" && !polytope.isSelected) || !polytope.isVisible) {
				continue;
		  	}
			const evaluationResult = evaluationFun(polytope);
			const value = Array.isArray(evaluationResult) ? evaluationResult : [evaluationResult];

		  	minValue = Math.min(minValue, ...value);
		  	maxValue = Math.max(maxValue, ...value);
		  	valueList.push(...value);
	  	}
	   	data.title = title;
	   	data.x_axis = xAxis;
		data.list = valueList;
		data.min = minValue;
		data.max = maxValue;
		
	  	return data;
	}
}