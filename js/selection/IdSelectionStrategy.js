"use strict";

// requires "./SelectionStrategy";


class IdSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minId, maxId, idList) {
	  super(model, mode);
	  this.minId = minId;
	  this.maxId = maxId;
	  this.idList = idList;
	}

	selectPolytope(polytope) {
		super.selectPolytope(polytope, ['PolygonMesh', 'PolyhedronMesh'], 
			polytope => {
				const id = polytope.id;
				// Si hay cotas superiores e inferiores de id, lo selecciona si está en rango
				if (this.minId !== null) {
					return  this.minId <= id && id <= this.maxId;
				}
				// Si no hay cotas, lo selecciona si está en mi whitelist de ids
				return this.idList.includes(id.toString());
			}
		)
	}

	get text() {
		if (this.minId !== null) 
			return `By Id: ${this.minId} - ${this.maxId}`;
		return "By Id List";
	}
}