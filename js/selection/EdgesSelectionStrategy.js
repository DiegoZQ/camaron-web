"use strict";

// requires "./SelectionStrategy";


class EdgesSelectionStrategy extends SelectionStrategy {
	constructor(cpuModel, mode, edgesNumber) {
		super(cpuModel, mode);
		this.edgesNumber = edgesNumber;
	}

   // Selecciona un polígono si cumple con el número de lados.
	selectPolygon(polygon) {
		const isMatch = polygon.vertices.length == this.edgesNumber;
		polygon.isSelected = isMatch;
	}

	get text() {
		return `By Edges Number: ${this.edgesNumber}`;
	}
}