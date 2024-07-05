"use strict";


class EdgesEvaluationStrategy extends EvaluationStrategy {
    constructor(model, mode) {
        super(model, mode);
    }

    evaluate() {
        return super.evaluate(
            ['PolygonMesh'], 
            polytope => polytope.vertices.length, 
            'Edge Histogram', 
            'Edge Number'
        );
    }
}