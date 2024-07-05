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
        const [numVertices, dimensions] = this.loadHeader();
        if (dimensions == 2) {
            this.model = new PSLG();
            let startIndex = this.loadModelVertices(numVertices, 1, dimensions);
            startIndex = this.loadModelEdges(startIndex);
            this.loadModel2DHoles(startIndex);
        } else {
            this.model = new PolygonMesh();
            let startIndex = this.loadModelVertices(numVertices, 1, dimensions);
            this.loadModelFacets(startIndex);
        }
        this.model.vertices = Array.from(Object.values(this.model.vertices));
    }

    loadHeader() {
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

    // Carga todos los lados del modelo partiendo por un índice de inicio. Sólo funciona en 2D.
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
            const vertex1 = this.model.vertices[parseInt(vertexIndex1)];
            const vertex2 = this.model.vertices[parseInt(vertexIndex2)];
   
            edges[parseInt(index)] = new Edge(parseInt(index), vertex1, vertex2);
        }
        this.model.edges = Array.from(Object.values(edges));
        return startIndex + numEdges;
    }

    // Carga las facetas del modelo. Sólo funciona en 3D.
    loadModelFacets(startIndex) {
        const facetHeaderLineWords = getLineWords(this.fileArray[startIndex]);
        if (![1,2].includes(facetHeaderLineWords.length) || !isPositiveInteger(facetHeaderLineWords[0])) {
            throw new Error('Facet header error');
        }
        const numFacets = parseInt(facetHeaderLineWords[0]);
        const polygons = [];
        startIndex++;
        let offset = 0;
        let polygonCount = 1;
        for (let i = 0; i < numFacets; i++) {
            const facet = this.fileArray[startIndex + offset];
            const facetLineWords = getLineWords(facet);
            if (
                ![1,2,3].includes(facetLineWords.length) || 
                !isPositiveInteger(facetLineWords[0]) || 
                (facetLineWords[1] && !isNonNegativeInteger(facetLineWords[1]))
            ) {
                throw new Error('Facet format error');
            }
            const facetPolygonCount = parseInt(facetLineWords[0]);
            const facetHoleCount = facetLineWords[1] ? parseInt(facetLineWords[1]) : 0;
            const innerPolygons = [];
            let outerPolygon;

            for (let j = 0; j < facetPolygonCount; j++) {
                const polygonLineWords = getLineWords(this.fileArray[j + startIndex + offset + 1]);
                const sidesCount = parseInt(polygonLineWords[0]);
                if (polygonLineWords.length != sidesCount + 1) {
                   throw new Error('Facet polygon side count error');
                }
                // Ignora polígonos degenerados
                if (sidesCount < 3) continue;

                const polygon = new Polygon(polygonCount);
                // para cada índice de vértice
                for(let k = 1; k <= sidesCount; k++) {
                    const vertexIndex = parseInt(polygonLineWords[k]);
                    const vertex = this.model.vertices[vertexIndex];
                    // agrega cada vértice a los vértices del polígono
                    polygon.vertices.push(vertex);
                    // y agrega el nuevo polígono como parte de los polígonos de cada vértice si la faceta no tiene agujeros
                    if (!facetHoleCount) {
                        vertex.polygons.push(polygon);
                    }
                }
                // Se asume que el outerPolygon siempre es el primer polígono especificado
                if (j === 0) {
                    outerPolygon = polygon;
                } else {
                    innerPolygons.push(polygon);
                }
            }
            if (!outerPolygon) {
                throw new Error('The outer polygon must exist and not be degenerate'); 
            }
            if (facetHoleCount != innerPolygons.length) {
                throw new Error('Facet holes must be equal to facet inner polygons'); 
            }
            // Si hay agujeros, debo agregar como agujeros todos los polígonos internos al polígono externo
            if (facetHoleCount) {    
                const holeInfo = {};
                // Por cada agujero, busca al polígono interno de innerPolygons que lo contenga y lo asocia en el diccionario holeInfo.
                // Si hay más de un polígono interno que se podría asociar a un mismo agujero, se considera un error.
                for (let j = 0; j < facetHoleCount; j++) {
                    const holeLineWords = getLineWords(this.fileArray[j + startIndex + offset + 1 + facetPolygonCount]);
                    const holeId = parseInt(holeLineWords[0]);
                    const holeCoords = holeLineWords.slice(1, holeLineWords.length).map(parseFloat);
                    // Si el polígono exterior no contiene al agujero, se considera error.
                    if (!outerPolygon.pointInPolygon(holeCoords)) {
                        throw new Error('Could not triangulate facet due to bad hole position'); 
                    }
                    for (const innerPolygon of innerPolygons) {
                        if (innerPolygon.pointInPolygon(holeCoords)) {
                            // Si es el primer polígono interno que contiene al agujero, se convierte en agujero del polígono externo.
                            if (!holeInfo[holeId]) {
                                holeInfo[holeId] =  innerPolygon;
                                if (outerPolygon.polygonInPolygon(innerPolygon)) {
                                    outerPolygon.addPolygonAsHole(innerPolygon);
                                } else {
                                    throw new Error('Could not triangulate facet due to bad hole position');
                                }
                            } else {
                                throw new Error('Could not triangulate facet due to bad hole position');   
                            }
                        }
                    }            
                }
                // Agrego el outerPolygon a los vértices que los comprenden.
                for (const polygonVertex of outerPolygon.vertices) {
                    polygonVertex.polygons.push(outerPolygon);
                }
            }
            // Finalmente agrego a la lista de polígonos el polígono externo.
            polygons.push(outerPolygon);
            offset += 1 + facetPolygonCount + facetHoleCount;
            polygonCount++;
        }
        this.model.polygons = polygons;
    }

    // Carga los agujeros del modelo. Sólo funciona en 2D.
    loadModel2DHoles(startIndex) {
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
            if (holeLineWords.length != 3 || !isNonNegativeInteger(holeLineWords[0])) {
                throw new Error('Holes dimension format');
            }
            const id = parseInt(holeLineWords[0]);
            const holeCoords = holeLineWords.slice(1, holeLineWords.length).map(parseFloat);
            holeCoords.push(0);
            
            holes[id] = new Hole(id, ...holeCoords);;
        }
        this.model.holes = Array.from(Object.values(holes));
        return startIndex + numHoles;
    }

    _exportToPoly() {
        return this.fileArray.join('\n');
    }
} 