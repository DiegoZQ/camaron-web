"use strict";


class EvaluationStrategy {
	constructor(CPUModel, mode) {
		this.CPUModel = CPUModel;
  		this.mode = mode;
	}

	evaluate() {
		console.warn("This should be implemented by specific strategies.");
	}
}

export default EvaluationStrategy;