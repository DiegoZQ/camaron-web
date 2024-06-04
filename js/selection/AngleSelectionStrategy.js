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
		const availableModelTypes = ['PolygonMesh', 'PolyhedronMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
		const angles = this.model.modelType === 'PolygonMesh' ? polytope.angles : polytope.solidAngles;
		const isInRange = angles.some(angle => this.minAngle <= angle && angle <= this.maxAngle);
		polytope.isSelected = isInRange;
	}

	get text() {
		return `By Angle: ${this.minAngle} - ${this.maxAngle}`;
	}
}