"use strict";


/*--------------------------------------------------------------------------------------
---------------------------------------- HELPERS ---------------------------------------
----------------------------------------------------------------------------------------

These are helper functions that were not in any of the previous categories.
--------------------------------------------------------------------------------------*/
const degToRad = (d) => {
    return d * Math.PI / 180;
}
  
const radToDeg = (d) => {
    return d * 180 / Math.PI;
}
 
// Obtiene un arreglo con todas las palabras contenidas en un string
const getLineWords = (line) => {
    return line.match(/\S+/g);
}

const isPositiveInteger = (str) => {
    return /^[1-9]\d*$/.test(str);
}

const isNonNegativeInteger = (str) => {
    return /^\d+$/.test(str);
} 

// Genera un arreglo de números que comienza en 'start', avanza hasta 'end' (sin incluirlo)
// con incrementos definidos por 'step'.
const range = (start, end, steps=1) => {
    const result = [];
    for (let i = start; i < end; i+=steps) {
      result.push(i);
    }
    return result;
}

// Encuentra los vectores base u, v del plano que comprende a una list de vértices, a partir
// de 3 vértices no colineales. Retorn los vectores u,v además del índice del vértice utilizado
// para encontrar ambos vectores.
const findBasisVectorsFromVertices = (vertices) => {
    // Verifica si tres vértices son colineales
    const areNonCollinear = (p1, p2, p3) => {
        const u = vec3.subtract(vec3.create(), p2.coords, p1.coords);
        const v = vec3.subtract(vec3.create(), p3.coords, p2.coords);
        const crossProduct = vec3.cross(vec3.create(), u, v);
        return vec3.length(crossProduct) > 1e-5;
    }

    // Itera sobre los vértices para encontrar 3 puntos colineles
    for (let i = 0; i < vertices.length ; i++) {
        const prevIndex = (i - 1 + vertices.length) % vertices.length;
        const nextIndex = (i + 1) % vertices.length; 

        if (areNonCollinear(vertices[prevIndex], vertices[i], vertices[nextIndex])) {
            // Calcula los vectores base, u, v de los 3 puntos no colineles
            const u = vec3.subtract(vec3.create(), vertices[i].coords, vertices[prevIndex].coords);
            const v = vec3.subtract(vec3.create(), vertices[nextIndex].coords, vertices[i].coords);
            vec3.normalize(u, u);
            vec3.normalize(v, v);
            vec3.cross(v, u, v);
            vec3.cross(v, v, u);
            return [u, v, i];
        }
    }
}

// Mapea una lista de puntos 3D (cada 3 números corresponden a un punto) a un plano formado
// por los 2 vectores ortogonales v1, v2.
const mapTo2D = (points3D, v1, v2) => {
    const points2D = [];
    for (let i = 0; i < points3D.length; i+=3) {
        const point = [points3D[i], points3D[i+1], points3D[i+2]];
        const x = vec3.dot(point, v1);
        const y = vec3.dot(point, v2);
        points2D.push(...[x, y]);
    }
    return points2D;
}