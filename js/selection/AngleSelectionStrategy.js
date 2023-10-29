"use strict";

import SelectionStrategy from "./SelectionStrategy";
import { radToDeg } from "../helpers";


class AngleSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minAngle, maxAngle) {
	  	super(model, mode);
	  	this.minAngle = minAngle;
	  	this.maxAngle = maxAngle;
	}

	// Selecciona un poligono si al menos uno de sus ángulos internos está en el rango de ángulos.
	selectPolygon(polygon) {
		const angles = polygon.angles;
		let isInRange = false;

		for (let i = 0; i < angles.length; i++) {
			const angle = radToDeg(angles[i]);

			if (this.minAngle <= angle && angle <= this.maxAngle) {
				isInRange = true;
				break;
			}
		}
		polygon.isSelected = isInRange;
	}

	get text() {
		return `By Angle: ${this.minAngle} - ${this.maxAngle}`;
	}
}

export default AngleSelectionStrategy;