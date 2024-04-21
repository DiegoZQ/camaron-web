"use strict";

// requires "./ModelLoadStrategy";
// requires "../model/PolygonMesh";
// requires "../model/vertex";
// requires '../model/Polygon';
// requires "../helpers";


class PolyLoadStrategy extends ModelLoadStrategy {
    // https://wias-berlin.de/software/tetgen/fformats.poly.html
    // https://people.sc.fsu.edu/~jburkardt/data/poly/poly.html
    load() {
        return super.load(() => {
            const [numVertices, dimensions] = this.loadModelHeader();
            if (dimensions == 2) {
                this.cpuModel = new PSLG();
                let startIndex = this.loadModelVertices(numVertices, 1, dimensions);
                startIndex = this.loadModelEdges(startIndex);
                this.loadModelHoles(startIndex, dimensions);
            } else {
                this.cpuModel = new PolygonMesh();
                let startIndex = this.loadModelVertices(numVertices, 1, dimensions);
                this.loadModelPolygons(startIndex);
            }
            this.cpuModel.vertices = new Array(...Object.values(this.cpuModel.vertices));
        });
    }

    loadModelHeader() {
        const vertexLineWords = getLineWords(this.fileArray[0]);
        if (![2,3,4].includes(vertexLineWords.length) || !isPositiveInteger(vertexLineWords[0]) || !['2', '3'].includes(vertexLineWords[1])) {
            throw new Error('Vertex format error');
        }
        return [parseInt(vertexLineWords[0]), parseInt(vertexLineWords[1])];
    }

    // Carga los vértices del modelo tomando sus coordenadas x, y, z. Si tiene 2 dimensiones, agrega z=0 como la tercera dimensión.
    loadModelVertices(numVertices, startIndex, dimensions) {
        return super.loadModelVertices(numVertices, startIndex, dimensions, true);
    }

    // Carga todos los lados del modelo partiendo por un índice de inicio.
    loadModelEdges(startIndex) {
        const edgeLineWords = getLineWords(this.fileArray[startIndex]);
        // ej: Five segments with boundary markers.
        //     5 1
        if (edgeLineWords.length != 2 || !isPositiveInteger(edgeLineWords[0]) || !isNonNegativeInteger(edgeLineWords[1])) {
            throw new Error('edgeError');
        }
        const numEdges = parseInt(edgeLineWords[0]);
        const boundaryMarkers = !!parseInt(edgeLineWords[1]);
        startIndex++;

        if (startIndex + numEdges > this.fileArray.length) {
            throw new Error('edgeCountError');
        }

        const edges = {};
        for (let i = 0; i < numEdges; i++) {
            const line = this.fileArray[startIndex + i];
            const lineWords = getLineWords(line);
            if ((boundaryMarkers && lineWords.length != 4)  || (!boundaryMarkers && lineWords.length != 3)) {
                throw new Error('Edge format error');
            }
            
            const [index, vertexIndex1, vertexIndex2] = lineWords.slice(0, 3).map(parseFloat);
            const vertex1 = this.cpuModel.vertices[parseInt(vertexIndex1)];
            const vertex2 = this.cpuModel.vertices[parseInt(vertexIndex2)];
   
            edges[parseInt(index)] = new Edge(parseInt(index), vertex1, vertex2);
        }
        this.cpuModel.edges = new Array(...Object.values(edges));
        return startIndex + numEdges;
    }

    // Carga los polígonos del modelo si el número de polígonos es un entero positivo válido y está ubicado al inicio de la lectura,
    // sin ningún valor adicional en la misma línea.
    loadModelPolygons(startIndex) {
        const polygonLineWords = getLineWords(this.fileArray[startIndex]);
        if (![1,2].includes(polygonLineWords.length) || !isPositiveInteger(polygonLineWords[0])) {
            throw new Error('polygonError');
        }
        const numFacets = parseInt(polygonLineWords[0]);
        startIndex++;
        let offset = 0;
        const polygonIndices = [];
        for (let i = 0; i < numFacets; i++) {
            const facet = this.fileArray[startIndex + offset];
            const facetLineWords = getLineWords(facet);
            if (![1,2,3].includes(facetLineWords.length) || !isPositiveInteger(facetLineWords[0])) {
                throw new Error('Facet format error');
            }
            if (facetLineWords[1] && facetLineWords[1] != '0') {
                console.warn('Warning: Facet Holes not supported');
            }
            const facetPolygonCount = parseInt(facetLineWords[0]);
            const facetHoleCount = facetLineWords[1] ? parseInt(facetLineWords[1]) : 0;

            polygonIndices.push(...range(startIndex + offset + 1, startIndex + offset + 1 + facetPolygonCount));
            offset += 1 + facetPolygonCount + facetHoleCount;
        }
        return super.loadModelPolygons(polygonIndices.length, null, polygonIndices);
    }

    loadModelHoles(startIndex, dimensions) {
        const holeStartLineWords = getLineWords(this.fileArray[startIndex]);
        if (holeStartLineWords.length != 1 || !isNonNegativeInteger(holeStartLineWords[0])) {
            throw new Error('holeError');
        }
        const numHoles = parseInt(holeStartLineWords[0]);
        startIndex++;

        if (startIndex + numHoles > this.fileArray.length) {
            throw new Error('HolesCountError');
        }

        const holes = {};
        for (let i = 0; i < numHoles; i++) {
            const holeLineWords = getLineWords(this.fileArray[startIndex + i]);
            if (holeLineWords.length != dimensions + 1 || !isNonNegativeInteger(holeLineWords[0])) {
                throw new Error('Holes dimension format');
            }
            const id = parseInt(holeLineWords[0]);
            let holeCoords = holeLineWords.slice(1, holeLineWords.length).map(parseFloat);

            if (dimensions == 2) {
                holeCoords.push(0);
            }
            holes[id] = new Hole(id, ...holeCoords);;
        }
        this.cpuModel.holes = new Array(...Object.values(holes));
        return startIndex + numHoles;
    }

    _exportToPoly() {
        return this.fileArray.join('\n');
    }
} 