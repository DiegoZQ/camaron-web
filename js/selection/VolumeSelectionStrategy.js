"use strict";


class VolumeSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minVolume, maxVolume) {
		super(model, mode);
	  	this.minVolume = minVolume;
	  	this.maxVolume = maxVolume;
	}

	selectPolytope(polytope) {
		super.selectPolytope(polytope, ['PolyhedronMesh'], 
			polytope => {
				const volume = polytope.volume;
				return this.minVolume <= volume && volume <= this.maxVolume;
			}
		)
	}

	get text() {
		return `By Volume: ${this.minVolume} - ${this.maxVolume}`;
	}
}