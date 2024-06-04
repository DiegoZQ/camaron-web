"use strict";


class EdgesEvaluationStrategy extends EvaluationStrategy {
    constructor(model, mode) {
        super(model, mode);
    }

    evaluate() {
        const data = {};
        const edgeList = [];
        let minEdges = Infinity;
        let maxEdges = 0;

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
            const edges = polygon.vertices.length;
            edgeList.push(edges);
            maxEdges = Math.max(maxEdges, edges);
            minEdges = Math.min(minEdges, edges);
        }
        data.title = 'Edge Histogram';
        data.x_axis = 'Edge Number';
        data.list = edgeList;
        data.min = minEdges;
        data.max = maxEdges;
        return data;
    }
}