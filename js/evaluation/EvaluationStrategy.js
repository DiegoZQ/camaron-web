"use strict";


class EvaluationStrategy {
	constructor(model, mode) {
		this.model = model;
  		this.mode = mode;
	}

	evaluate() {
		console.warn("This should be implemented by specific strategies.");
	}
}

export default EvaluationStrategy;