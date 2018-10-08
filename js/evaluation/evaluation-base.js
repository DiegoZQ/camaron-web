var EvaluationStrategy = function(model, mode){
	this.model = model;
  	this.mode = mode;
}

EvaluationStrategy.prototype.evaluate = function(element){
	alert("This should be implemented by specific strategies.")
}