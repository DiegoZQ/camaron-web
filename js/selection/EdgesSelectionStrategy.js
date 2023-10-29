"use strict";

import SelectionStrategy from "./SelectionStrategy";


class EdgesSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, edgesNumber) {
		super(model, mode);
		this.edgesNumber = edgesNumber;
	}

   // Selecciona un polígono si cumple con el número de lados.
	selectPolygon(polygon) {
		const isMatch = polygon.vertices.length === this.edgesNumber;
		polygon.isSelected = isMatch;
	}

	get text() {
		return `By Edges Number: ${this.edgesNumber}`;
	}
}

export default EdgesSelectionStrategy;