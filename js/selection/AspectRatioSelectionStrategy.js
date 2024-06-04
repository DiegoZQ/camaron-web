"use strict";


class AspectRatioSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minAspectRatio, maxAspectRatio) {
		super(model, mode);
		this.minAspectRatio = minAspectRatio;
        this.maxAspectRatio = maxAspectRatio;
	}

   // Selecciona un polítopo si cumple con el número de lados.
	selectPolytope(polytope) {
		const availableModelTypes = ['PolygonMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
        const aspectRatio = polytope.aspectRatio;
		const isInRange = this.minAspectRatio <= aspectRatio && aspectRatio <= this.maxAspectRatio;
		polytope.isSelected = isInRange;
	}

	get text() {
		return `By Aspect Ratio: ${this.minAspectRatio} - ${this.maxAspectRatio}`;
	}
}