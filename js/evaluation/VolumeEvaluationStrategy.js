"use strict";


class VolumeEvaluationStrategy extends EvaluationStrategy {
    constructor(model, mode) {
        super(model, mode);
    }

    evaluate() {
        return super.evaluate(
            ['PolyhedronMesh'], 
            polytope => polytope.volume, 
            'Volume Histogram', 
            'Volume'
        );
    }
}