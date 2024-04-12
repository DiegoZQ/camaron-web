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
        return this._load(() => {
            let [startIndex, dimensions] = this.loadModelVertices();
            if (this.cpuModel.modelType === 'PSLG') {
                startIndex = this.loadModelEdges(startIndex);
                this.loadModelHoles(startIndex, dimensions);
            } else {
                this.loadModelPolygons(startIndex);
            }
        });
    }

   // Carga los vértices del modelo tomando sus coordenadas x, y, z. Si tiene 2 dimensiones, agrega z=0 como la tercera dimensión.
    loadModelVertices() {
        const vertexLineWords = getLineWords(this.fileArray[0]);
        if ((vertexLineWords.length < 2 || vertexLineWords.length > 4) || !isPositiveInteger(vertexLineWords[0]) || !['2', '3'].includes(vertexLineWords[1])) {
            throw new Error('Vertex format error');
        }

        const [numVertices, dimensions] = [parseInt(vertexLineWords[0]), parseInt(vertexLineWords[1])];

        if (dimensions == 2) {
            this.cpuModel = new PSLG();
        } else {
            this.cpuModel = new PolygonMesh();
        }
        const startIndex = 1;
        if (startIndex + numVertices > this.fileArray.length) {
            throw new Error('vertexCountError');
        }

        for (let i = 0; i < numVertices; i++) {
            let vertexData = getLineWords(this.fileArray[startIndex + i]).slice(0, dimensions+1);
            if (dimensions === 2) {
                vertexData.push(0);
            }
            this.fileArray[startIndex + i] = vertexData.join(' ');
        }        
        return [super._loadModelVertices(numVertices, startIndex, true), dimensions];
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
        this.cpuModel.edges = edges;
        return startIndex + numEdges;
    }

    // Carga los polígonos del modelo si el número de polígonos es un entero positivo válido y está ubicado al inicio de la lectura,
    // sin ningún valor adicional en la misma línea.
    loadModelPolygons(startIndex) {
        const polygonLineWords = getLineWords(this.fileArray[startIndex]);
        if (polygonLineWords.length != 2 || !isPositiveInteger(polygonLineWords[0])) {
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
                console.warn('Warning: Holes not supported');
            }
            const facetPolygonCount = parseInt(facetLineWords[0]);
            const facetHoleCount = facetLineWords[1] ? parseInt(facetLineWords[1]) : 0;

            polygonIndices.push(...range(startIndex + offset + 1, startIndex + offset + 1 + facetPolygonCount));
            offset += 1 + facetPolygonCount + facetHoleCount;
        }
        return super._loadModelPolygons(polygonIndices.length, null, polygonIndices);
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
        this.cpuModel.holes = holes;
        return startIndex + numHoles;
    }
} 