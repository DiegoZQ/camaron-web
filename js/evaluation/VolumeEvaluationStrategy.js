"use strict";


class VolumeEvaluationStrategy extends EvaluationStrategy {
    constructor(model, mode) {
        super(model, mode);
    }

    evaluate() {
        const data = {};
        const volumeList = [];
        let minVolume = Infinity;
        let maxVolume = 0;

        const availableModelTypes = ['PolyhedronMesh'];
		if (!availableModelTypes.includes(this.model.modelType)) {
			return;
		}
        const polyhedrons = this.model.polyhedrons;
        // Itera sobre los polígonos del model
        for (const polyhedron of polyhedrons) {
            if ((this.mode === "selection" && !polyhedron.isSelected) || !polyhedron.isVisible) {
                continue;
            }
            // Obtiene el área de cada polígono	
            const volume = polyhedron.volume;
            volumeList.push(volume);
            maxVolume = Math.max(maxVolume, volume);
            minVolume = Math.min(minVolume, volume);
        }
        data.title = 'Volume Histogram';
        data.x_axis = 'Volume';
        data.list = volumeList;
        data.min = minVolume;
        data.max = maxVolume;
        return data;
    }
}