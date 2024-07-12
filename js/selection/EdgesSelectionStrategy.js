"use strict";

// requires "./SelectionStrategy";


class EdgesSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, edgesNumber) {
		super(model, mode);
		this.edgesNumber = edgesNumber;
	}

   // Selecciona un polítopo si cumple con el número de lados.
   	selectPolytope(polytope) {
		super.selectPolytope(polytope, ['PolygonMesh'], 
			polytope => polytope.vertices.length == this.edgesNumber
		)
	}

	get text() {
		return `By Edges Number: ${this.edgesNumber}`;
	}
}