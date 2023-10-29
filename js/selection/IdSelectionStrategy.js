"use strict";

import SelectionStrategy from "./SelectionStrategy";


class IdSelectionStrategy extends SelectionStrategy {
	constructor(model, mode, minId, maxId, idList) {
	  super(model, mode);
	  this.minId = minId;
	  this.maxId = maxId;
	  this.idList = idList;
	}

	// Selecciona un polígono
	selectPolygon(polygon) {
		const id = polygon.id;
		// Si hay cotas superiores e inferiores de id, lo selecciona si está en rango
		if (this.minId !== null) {
		  const isInRange = this.minId <= id && id <= this.maxId;
		  polygon.isSelected = isInRange;
		} 
		// Si no hay cotas, lo selecciona si está en mi whitelist de ids
		else {
		  const strId = id.toString();
		  polygon.setSelected(this.idList.includes(strId));
		}
	}

	get text() {
		if (this.minId !== null) 
			return `By Id: ${this.minId} - ${this.maxId}`;
		return "By Id List";
	}
}

export default IdSelectionStrategy;