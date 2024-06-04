"use strict";


class VolumeSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minVolume, maxVolume) {
		super(model, mode);
	  	this.minVolume = minVolume;
	  	this.maxVolume = maxVolume;
	}

	// Selecciona un polítopo si está en el rango de área.
	selectPolytope(polytope) {
		const availableModelTypes = ['PolyhedronMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
		const volume = polytope.volume;
		const isInRange = this.minVolume <= volume && volume <= this.maxVolume;
		polytope.isSelected = isInRange;
	}

	get text() {
		return `By Volume: ${this.minVolume} - ${this.maxVolume}`;
	}
}