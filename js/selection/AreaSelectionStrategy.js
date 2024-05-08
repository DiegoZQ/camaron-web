"use strict";

// requires "./SelectionStrategy";


class AreaSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minArea, maxArea) {
		super(model, mode);
	  	this.minArea = minArea;
	  	this.maxArea = maxArea;
	}

	// Selecciona un polígono si está en el rango de área.
	selectPolygon(polygon) {
		const area = polygon.area;
		const isInRange = this.minArea <= area && area <= this.maxArea;
		polygon.isSelected = isInRange;
	}

	getText() {
		return `By Area: ${this.minArea} - ${this.maxArea}`;
	}
}