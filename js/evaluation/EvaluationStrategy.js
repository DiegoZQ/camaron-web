"use strict";


class EvaluationStrategy {
	constructor(cpuModel, mode) {
		this.cpuModel = cpuModel;
  		this.mode = mode;
	}

	evaluate() {
		console.warn("This should be implemented by specific strategies.");
	}
}