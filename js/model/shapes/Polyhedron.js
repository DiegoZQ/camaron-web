"use strict";


class Polyhedron extends Shape {
    constructor(id) {
        super(id);
        this.vertices = {};
        this.polygons = [];
        this._area = null;
    }

    // Obtiene el área del poliedro.
    get area() {
        // Si todavía no la ha calculado, lo hace sumando las áreas de los polígonos que lo componen.
        if (this._area == null) {
            let total = 0;
            for (const polygon of this.polygons) {
                total += polygon.area;
            }
            this._area = total;
        }
        return this._area;
    }

    // Obtiene el volumen del poliedro.
    // https://stackoverflow.com/questions/1838401/general-formula-to-calculate-polyhedron-volume
    get volume() {
        if (this._volume == null) {
            let total = 0;
            for (const polygon of this.polygons) {
                const trianglesVertexCoords = polygon.trianglesVertexCoords;
                // Por cada triángulo, genera un tetrahedro agregando el origen como 4to vértice
                // y calcula su volumen a través del determinante.
                for (let i = 0; i < polygon.trianglesCount; i++) {
                    const j = i * 9;
                    const matrix = mat4.fromValues(
                        trianglesVertexCoords[j], trianglesVertexCoords[j+1], trianglesVertexCoords[j+2], 1,  // Column 1
                        trianglesVertexCoords[j+3], trianglesVertexCoords[j+4], trianglesVertexCoords[j+5], 1,  // Column 2
                        trianglesVertexCoords[j+6], trianglesVertexCoords[j+7], trianglesVertexCoords[j+8], 1,  // Column 3
                        0, 0, 0, 1   // Column 4
                    );
                    total += mat4.determinant(matrix);
                }
            }
            this._volume = total/6;
        }
        return this._volume;
    }


}