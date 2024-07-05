"use strict";

// requires "./SelectionStrategy";


class AreaSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minArea, maxArea) {
		super(model, mode);
	  	this.minArea = minArea;
	  	this.maxArea = maxArea;
	}

	// Selecciona un polítopo si está en el rango de área.
	selectPolytope(polytope) {
		const availableModelTypes = ['PolygonMesh', 'PolyhedronMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
		const area = this.model.modelType === 'PolygonMesh' ? polytope.area : polytope.surface;
		const isInRange = this.minArea <= area && area <= this.maxArea;
		polytope.isSelected = isInRange;
	}

	get text() {
		return `By ${this.model.modelType === 'PolygonMesh' ? 'Area' : 'Surface'}: ${this.minArea} - ${this.maxArea}`;
	}
}