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
        const [numVertices, dimensions] = this.loadModelHeader();
        if (dimensions == 2) {
            this.model = new PSLG();
            let startIndex = this.loadModelVertices(numVertices, 1, dimensions);
            startIndex = this.loadModelEdges(startIndex);
            this.loadModelHoles(startIndex, dimensions);
        } else {
            this.model = new PolygonMesh();
            let startIndex = this.loadModelVertices(numVertices, 1, dimensions);
            this.loadModelFacets(startIndex);
        }
        this.model.vertices = Array.from(Object.values(this.model.vertices));
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
            const vertex1 = this.model.vertices[parseInt(vertexIndex1)];
            const vertex2 = this.model.vertices[parseInt(vertexIndex2)];
   
            edges[parseInt(index)] = new Edge(parseInt(index), vertex1, vertex2);
        }
        this.model.edges = Array.from(Object.values(edges));
        return startIndex + numEdges;
    }

    loadModelFacets(startIndex) {
        const facetHeaderLineWords = getLineWords(this.fileArray[startIndex]);
        if (![1,2].includes(facetHeaderLineWords.length) || !isPositiveInteger(facetHeaderLineWords[0])) {
            throw new Error('Facet header error');
        }
        const numFacets = parseInt(facetHeaderLineWords[0]);
        const polygons = [];
        startIndex++;
        let offset = 0;
        let polygonCount = 0;
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
            const facetPolygons = [];

            for (let j = 0; j < facetPolygonCount; j++) {
                const polygonLineWords = getLineWords(this.fileArray[j + startIndex + offset + 1]);
                const sidesCount = parseInt(polygonLineWords[0]);
                if (polygonLineWords.length != sidesCount + 1) {
                   throw new Error('Facet polygon side count error');
                }
                const polygon = new Polygon(polygonCount + j + 1);
                // para cada índice de vértice
                for(let k = 1; k <= sidesCount; k++) {
                    const vertexIndex = parseInt(polygonLineWords[k]);
                    const vertex = this.model.vertices[vertexIndex];
                    // agrega cada vértice a los vértices del polígono
                    polygon.vertices.push(vertex);
                    // y agrega el nuevo polígono como parte de los polígonos de cada vértice
                    // si no tiene agujeros, ya que si tiene, este polígono podría ser eliminado.
                    if (!facetHoleCount) {
                        vertex.polygons.push(polygon);
                    }
                }
                facetPolygons.push(polygon);
            }
            // Si no hay agujeros, simplemente agrego todos los polígonos
            if (!facetHoleCount) {
                polygons.push(...facetPolygons);
            }
            // Si hay agujeros, debo remover a algunos polígonos
            else {
                // Crea un diccionario con los polígonos activos para hacer merge a otro
                const activeFacetPolygons = {};
                facetPolygons.forEach(facetPolygon => {
                    activeFacetPolygons[facetPolygon.id] = true;
                })
                const finalFacetPolygons = {};
                const holeInfo = {};
                // Por cada agujero, busca todos los polígonos de facetPolygons que lo contengan y los asocia como lista en el diccionario holeInfo
                for (let j = 0; j < facetHoleCount; j++) {
                    const holeLineWords = getLineWords(this.fileArray[j + startIndex + offset + 1 + facetPolygonCount]);
                    const holeId = parseInt(holeLineWords[0]);
                    const holeCoords = holeLineWords.slice(1, holeLineWords.length).map(parseFloat);
                    for (const facetPolygon of facetPolygons) {
                        if (facetPolygon.pointInPolygon(holeCoords)) {
                            if (holeInfo[holeId] && holeInfo[holeId].length) {
                                holeInfo[holeId].push(facetPolygon);
                            } else {
                                holeInfo[holeId] =  [facetPolygon];
                            }
                        }
                    }            
                }
                // Ordena los polígonos que continen a cada agujero por su área
                outerLoop: for (const holeId in holeInfo) {
                    holeInfo[holeId] = holeInfo[holeId].sort((a, b) => a.area - b.area);
                    // Toma el polígono más pequeño que contiene el agujero
                    const smallPolygon = holeInfo[holeId][0];
                    if (!activeFacetPolygons[smallPolygon.id]) {
                        continue;
                    } 
                    // Itera sobre los polígonos más grandes y busca uno que contenga completamente al polígono pequeño
                    for (let j = 1; j < holeInfo[holeId].length; j++) {
                        const bigPolygon = holeInfo[holeId][j];
                        // Si lo encuentra, agrega los vértices del polígono más pequeño al polígono más grande 
                        // y lo triangula con earcut 
                        if (bigPolygon.polygonInPolygon(smallPolygon)) {
                            // Hace que ambos polígonos no se puedan unir a otro más grande como agujeros
                            activeFacetPolygons[smallPolygon.id] = false;
                            activeFacetPolygons[bigPolygon.id] = false; 
                            // TODO: ver caso donde bigPolygon y smallPolygon comparten vértice.
                            //for (const vertex of smallPolygon.vertices) {
                            //    bigPolygon.vertices[vertex.id] = vertex;
                            //}
                            bigPolygon.addPolygonAsHole(smallPolygon);
                            finalFacetPolygons[bigPolygon.id] = bigPolygon;
                            continue outerLoop;
                        }
                    }
                    throw new Error('Could not triangulate facet due to bad hole position');            
                }
                // Agrego los polígonos sobrevivientes a los vértices que los comprenden.
                for (const facetPolygonId in finalFacetPolygons) {
                    const facetPolygon = finalFacetPolygons[facetPolygonId];
                    const polygonVertices = facetPolygon.vertices;
                    for (const polygonVertex of polygonVertices) {
                        polygonVertex.polygons.push(facetPolygon);
                    }
                }
                polygons.push(...Object.values(finalFacetPolygons));
            }
            offset += 1 + facetPolygonCount + facetHoleCount;
            polygonCount += facetPolygonCount;
        }
        this.model.polygons = polygons;
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
            const holeCoords = holeLineWords.slice(1, holeLineWords.length).map(parseFloat);

            if (dimensions == 2) {
                holeCoords.push(0);
            }
            holes[id] = new Hole(id, ...holeCoords);;
        }
        this.model.holes = Array.from(Object.values(holes));
        return startIndex + numHoles;
    }

    _exportToPoly() {
        return this.fileArray.join('\n');
    }
} 