"use strict";

// requires "./SelectionStrategy";


class IdSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minId, maxId, idList) {
	  super(model, mode);
	  this.minId = minId;
	  this.maxId = maxId;
	  this.idList = idList;
	}

	// Selecciona un polítopo
	selectPolytope(polytope) {
		const availableModelTypes = ['PolygonMesh', 'PolyhedronMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
		const id = polytope.id;
		// Si hay cotas superiores e inferiores de id, lo selecciona si está en rango
		if (this.minId !== null) {
		  const isInRange = this.minId <= id && id <= this.maxId;
		  polytope.isSelected = isInRange;
		} 
		// Si no hay cotas, lo selecciona si está en mi whitelist de ids
		else {
		  const strId = id.toString();
		  polytope.isSelected = this.idList.includes(strId);
		}
	}

	get text() {
		if (this.minId !== null) 
			return `By Id: ${this.minId} - ${this.maxId}`;
		return "By Id List";
	}
}