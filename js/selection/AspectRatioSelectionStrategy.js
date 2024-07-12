"use strict";


class AspectRatioSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minAspectRatio, maxAspectRatio) {
		super(model, mode);
		this.minAspectRatio = minAspectRatio;
        this.maxAspectRatio = maxAspectRatio;
	}
	
   	// Selecciona un polítopo si cumple con el aspect ratio.
   	selectPolytope(polytope) {
		super.selectPolytope(polytope, ['PolygonMesh'], 
			polytope => {
				const aspectRatio = polytope.aspectRatio;
				return this.minAspectRatio <= aspectRatio && aspectRatio <= this.maxAspectRatio;
			}
		)
	}

	get text() {
		return `By Aspect Ratio: ${this.minAspectRatio} - ${this.maxAspectRatio}`;
	}
}