"use strict";

// requires "./SelectionStrategy";


class EdgesSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, edgesNumber) {
		super(model, mode);
		this.edgesNumber = edgesNumber;
	}

   // Selecciona un polítopo si cumple con el número de lados.
	selectPolytope(polytope) {
		const availableModelTypes = ['PolygonMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
		const isMatch = polytope.vertices.length == this.edgesNumber;
		polytope.isSelected = isMatch;
	}

	get text() {
		return `By Edges Number: ${this.edgesNumber}`;
	}
}