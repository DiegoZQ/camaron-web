"use strict";


class AspectRatioEvaluationStrategy extends EvaluationStrategy {
    constructor(model, mode) {
        super(model, mode);
    }

    evaluate() {
        return super.evaluate(
            ['PolygonMesh'], 
            polytope => polytope.aspectRatio, 
            'Aspect Ratio Histogram', 
            'Aspect Ratio'
        );
    }
}