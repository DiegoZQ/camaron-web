"use strict";


class AngleEvaluationStrategy extends EvaluationStrategy {
	constructor(model, mode) {
      	super(model, mode);
   	}

	evaluate() {
		return super.evaluate(
		   	['PolygonMesh', 'PolyhedronMesh'], 
		   	polytope => this.model.modelType === 'PolygonMesh' ? polytope.angles : polytope.solidAngles, 
			'Angles Histogram',
		   	this.model.modelType === 'PolygonMesh' ? 'Angles (radian)' : 'Angles (steradian)',
		);
	}
}