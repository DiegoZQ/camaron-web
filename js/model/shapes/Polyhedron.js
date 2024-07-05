"use strict";


class Polyhedron extends Shape {
    constructor(id) {
        super(id);
        this.vertices = {};
        this.polygons = [];
        this._surface = null;
        this._solidAngles = [];
        this.isVisible = true;
        this._minAngle = null;
    }

    get isSelected() {
        return this._isSelected;
    }

    set isSelected(value) {
        this._isSelected = value;
        for (const polygon of this.polygons) {
            polygon._isSelected = value;
        }
    }

    // Obtiene la superficie del poliedro.
    get surface() {
        // Si todavía no la ha calculado, lo hace sumando las áreas de los polígonos que lo componen.
        if (this._area == null) {
            let total = 0;
            for (const polygon of this.polygons) {
                total += polygon.area;
            }
            this._surface = total;
        }
        return this._surface;
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
            this._volume = Math.abs(total/6);
        }
        return this._volume;
    }

    // Calcula el ángulo sólido de los vértices del poliedro. 
    // Sólo calcula los ángulos sólidos de aquellos vértices que tienen a lo más 3 caras,
    // ya sea convexo o no convexo.
    // https://en.wikipedia.org/wiki/Spherical_law_of_cosines
    // https://vanderbei.princeton.edu/WebGL/GirardThmProof.html
    get solidAngles() {
        if (!this._solidAngles.length) {
            for (const vertex of this.vertices) {
                const faces = vertex.polygons.filter(polygon => this.polygons.includes(polygon));
                if (faces.length > 3) {
                    throw Error('Solid angle calculus between more than 3 faces is not implemented yet');
                }
                const angles = [];
                for (const face of faces) {
                    const faceVertexIndex = face.vertices.findIndex(v => v.id == vertex.id);
                    angles.push(face.angles[faceVertexIndex]);
                }
                const [a, b, c] = angles;
                // spherical law of cosines states
                // cos(c) = cos(a)cos(b) + sin(a)sin(b)cos(gamma);
                // => gamma = arcos((cos(c) - cos(a)cos(b) / (sin(a)sin(b)))
                const alfa = Math.acos((Math.cos(a) - Math.cos(b)*Math.cos(c)) / (Math.sin(b)*Math.sin(c)));
                const beta = Math.acos((Math.cos(b) - Math.cos(a)*Math.cos(c)) / (Math.sin(a)*Math.sin(c)));
                const gamma = Math.acos((Math.cos(c) - Math.cos(a)*Math.cos(b)) / (Math.sin(a)*Math.sin(b)));
                // Corrige los lados si los ángulos iniciales eran mayores a PI.
                const correctedAlfa = (a > Math.PI) ? 2 * Math.PI - alfa : alfa;
                const correctedBeta = (b > Math.PI) ? 2 * Math.PI - beta : beta;
                const correctedGamma = (c > Math.PI) ? 2 * Math.PI - gamma : gamma;
                // Girard's theorem
                // Area(Triangle) = Radius^2 x AngleExcess; AngleExcess = alfa + beta + gamma - Math.PI;
                this._solidAngles.push(correctedAlfa + correctedBeta + correctedGamma - Math.PI);
            }
        }
        return this._solidAngles;
    }

    get minAngle() {
        if (this._minAngle == null) {
            const angles = this.solidAngles;
            this._minAngle = Math.min(...angles);
        }
        return this._minAngle;
    }
}