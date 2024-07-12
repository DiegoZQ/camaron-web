"use strict";


class AreaEvaluationStrategy extends EvaluationStrategy {
   constructor(model, mode) {
      super(model, mode);
  	}

   evaluate() {
      return super.evaluate(
         ['PolygonMesh', 'PolyhedronMesh'], 
         polytope => this.model.modelType === 'PolygonMesh' ? polytope.area : polytope.surface, 
         this.model.modelType === 'PolygonMesh' ? ' Area Histogram' : 'Surface Histogram',
         this.model.modelType === 'PolygonMesh' ? ' Area' : 'Surface',
      );
   }
}