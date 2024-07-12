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
		super.selectPolytope(polytope, ['PolygonMesh', 'PolyhedronMesh'], 
			polytope => {
				const area = this.model.modelType === 'PolygonMesh' ? polytope.area : polytope.surface;
				return this.minArea <= area && area <= this.maxArea;
			}
		)
	}

	get text() {
		return `By ${this.model.modelType === 'PolygonMesh' ? 'Area' : 'Surface'}: ${this.minArea} - ${this.maxArea}`;
	}
}