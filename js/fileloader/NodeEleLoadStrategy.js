"use strict";


class NodeEleLoadStrategy extends NodeLoadStrategy {
    constructor(nodeFileArray, eleFileArray) {
        super(nodeFileArray);
        this.eleFileArray = this.normalizeFileArray(eleFileArray);
    }

    load() {
        this.model = new PolyhedronMesh();
        this.loadModelVertices();
        this.loadModelPolyhedrons();
        this.model.vertices = Array.from(Object.values(this.model.vertices));
        this.model.polygons = Array.from(Object.values(this.model.polygons));
    }

    // Carga los tetraedros del archivo .ele (guardado en eleFileArray) y los triangulos que componen cada tetraedro
    // en los poliedros y polígonos del modelo.
    // Cada tetraedro es de la forma: <id> <vertex1> <vertex2> <vertex3> <vertex4> <...attributes>[Opcional].
    // https://wias-berlin.de/software/tetgen/fformats.ele.html
    loadModelPolyhedrons() {
        const polyhedronLineWords = getLineWords(this.eleFileArray[0]);
        if (
            ![2,3].includes(polyhedronLineWords.length) || 
            !isPositiveInteger(polyhedronLineWords[0]) || 
            polyhedronLineWords[1] !== '4'
        ) {
            throw new Error('Polyhedron header format error');
        }
        const numPolyhedrons = parseInt(polyhedronLineWords[0]);

        if (numPolyhedrons + 1 > this.eleFileArray.length) {
            throw new Error('Polyhedron count error');
        }
        const polyhedrons = new Array(numPolyhedrons);
        const polygons = [];
        let polygonId = 1;
        for (let i = 0; i < numPolyhedrons; i++) {
            const line = this.eleFileArray[i + 1];
            const lineWords = getLineWords(line);

            if (lineWords.length < 5) {
                throw new Error('Polyhedron format error');
            }

            const polyhedron = new Polyhedron(lineWords[0]);
            const triangularFaces = tetTriangularFaces(...lineWords.slice(1, 5));
            // Cada nueva cara que se crea pertenece sólo a un poliedro, ya que dada su orientación
            // es imposible que otro poliedro adyacente tenga el mismo polígono a menos que esté mal diseñado.
            // Por tanto cada polígono sólo tiene 1 poliedro asociado.
            for (const triangularFace of triangularFaces) {
                const polygon = new Polygon(polygonId);
                for (const vertexId of triangularFace) {
                    const vertex = this.model.vertices[vertexId];
                    polygon.vertices.push(vertex);
                    vertex.polygons.push(polygon);
                    polyhedron.vertices[vertexId] = vertex;
                    vertex.polyhedrons[polyhedron.id] = polyhedron;
                }
                polygonId++;
                polyhedron.polygons.push(polygon);
                polygons.push(polygon);
            }
            polyhedron.vertices = Array.from(Object.values(polyhedron.vertices));
            polyhedrons[i] = polyhedron;
        }
        Object.keys(this.model.vertices).forEach(key => {
            this.model.vertices[key].polyhedrons = Array.from(Object.values(this.model.vertices[key].polyhedrons));
        })
        this.model.polygons = polygons;
        this.model.polyhedrons = polyhedrons;
    }

    _exportToEle() {
        return this.eleFileArray.join('\n');
    }
} 