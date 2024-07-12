"use strict";

// requires "./SelectionStrategy";
// requires "../helpers";


class AngleSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minAngle, maxAngle) {
	  	super(model, mode);
	  	this.minAngle = minAngle;
	  	this.maxAngle = maxAngle;
	}

	// Selecciona un polítopo si está en el rango de ángulos.
	selectPolytope(polytope) {
		super.selectPolytope(polytope, ['PolygonMesh', 'PolyhedronMesh'], 
			polytope => {
				const angles = this.model.modelType === 'PolygonMesh' ? polytope.angles : polytope.solidAngles;
				return angles.some(angle => this.minAngle <= angle && angle <= this.maxAngle);
			}
		)
	}

	get text() {
		return `By Angle: ${this.minAngle} - ${this.maxAngle}`;
	}
}