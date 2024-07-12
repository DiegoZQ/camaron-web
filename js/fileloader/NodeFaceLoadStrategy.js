"use strict";


class NodeFaceLoadStrategy extends NodeLoadStrategy {
    constructor(nodeFileArray, faceFileArray) {
        super(nodeFileArray);
        this.faceFileArray = this.normalizeFileArray(faceFileArray);
    }

    load() {
        this.model = new PolygonMesh();
        this.loadModelVertices();
        this.loadModelPolygons();
        this.model.vertices = Array.from(Object.values(this.model.vertices));
    }

    // Carga los triángulos del archivo .face (guardado en faceFileArray) en el modelo.
    // Cada triángulo es de la forma: <id> <vertex1> <vertex2> <vertex3> <marker>[Opcional].
    // https://wias-berlin.de/software/tetgen/fformats.face.html
    loadModelPolygons() {
        const polygonLineWords = getLineWords(this.faceFileArray[0]);
        if (![1,2].includes(polygonLineWords.length) || !isPositiveInteger(polygonLineWords[0])) {
            throw new Error('Face header format error');
        }
        const numPolygons = parseInt(polygonLineWords[0]);
    
        if (numPolygons + 1 > this.faceFileArray.length) {
            throw new Error('Face count error');
        }
        const polygons = new Array(numPolygons);
        for (let i = 0; i < numPolygons; i++) {
            const line = this.faceFileArray[i + 1];
            const lineWords = getLineWords(line);

            if (![4,5].includes(lineWords.length)) {
                throw new Error('Face format error');
            }
            const polygon = new Polygon(lineWords[0]);
            // para cada índice de vértice
            for(let j = 1; j < 4; j++) {
                const vertexIndex = parseInt(lineWords[j]);
                const vertex = this.model.vertices[vertexIndex];
                // agrega cada vértice a los vértices del polígono
                polygon.vertices.push(vertex);
                // y agrega el nuevo polígono como parte de los polígonos de cada vértice
                vertex.polygons.push(polygon);
            }
            polygons[i] = polygon;
        }
        this.model.polygons = polygons;
    }

    _exportToFace() {
        return this.faceFileArray.join('\n');
    }
} 