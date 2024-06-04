"use strict";


class AspectRatioEvaluationStrategy extends EvaluationStrategy {
    constructor(model, mode) {
        super(model, mode);
    }

    evaluate() {
        const data = {};
        const aspectRatioList = [];
        let minAspectRatio = Infinity;
        let maxAspectRatio = 0;

        const availableModelTypes = ['PolygonMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
        const polygons = this.model.polygons;
        // Itera sobre los polígonos del model
        for (const polygon of polygons) {
            if ((this.mode === "selection" && !polygon.isSelected) || !polygon.isVisible) {
                continue;
            }
            const aspectRatio = polygon.aspectRatio;
            aspectRatioList.push(aspectRatio);
            maxAspectRatio = Math.max(maxAspectRatio, aspectRatio);
            minAspectRatio = Math.min(minAspectRatio, aspectRatio);
        }
        data.title = 'Aspect Ratio Histogram';
        data.x_axis = 'Aspect Ratio';
        data.list = aspectRatioList;
        data.min = minAspectRatio;
        data.max = maxAspectRatio;
        return data;
    }
}