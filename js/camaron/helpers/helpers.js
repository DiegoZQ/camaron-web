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

const getRandomInt = () => {
    return Math.ceil(Math.random() * 32676);
}

const isPositiveInteger = (str) => {
    return /^[1-9]\d*$/.test(str);
}

const isNonNegativeInteger = (str) => {
    return /^\d+$/.test(str);
} 

// Convierte a 0 el número si es muy pequeño
const smallToZero = (number) => {
    return Math.abs(number) <= 0.0001 ? 0 : number;
}

// Retorna un número si está dentro de un rango min-max, si es menor a min, retorna min y si es
// mayor a max retorna max.
const segmentNumber = (number, min, max) => {
    return Math.max(min, Math.min(number, max));
}

// Escala un vlor que está en un rango [minInput, maxInput] a su equivalente en un rango [minOutput, maxOutput].
const scaleValue = (value, minInput, maxInput, minOutput, maxOutput) => {
    const normalizedValue = (value - minInput) / (maxInput - minInput);
    const scaledValue = normalizedValue * (maxOutput - minOutput) + minOutput;
    return scaledValue;
}

// Verifica que 2 vectores tengan la misma dirección. Retorna true si la tienen, false si no.
const sameDirection = (vector1, vector2) => {
    return (
        smallToZero(vector1[0]) * smallToZero(vector2[0]) >= 0 && 
        smallToZero(vector1[1]) * smallToZero(vector2[1]) >= 0 && 
        smallToZero(vector1[2]) * smallToZero(vector2[2]) >= 0
    )
};

// Encuentra los vectores base u, v del plano que comprende a una list de vértices, a partir
// de 3 vértices no colineales. Retorn los vectores u,v además del índice del vértice utilizado
// para encontrar ambos vectores.
const findBasisVectorsFromVertices = (vertices) => {
    // Verifica si tres vértices son colineales
    const areNonCollinear = (p1, p2, p3) => {
        const u = vec3.subtract(vec3.create(), p2.coords, p1.coords);
        const v = vec3.subtract(vec3.create(), p3.coords, p2.coords);
        const crossProduct = vec3.cross(vec3.create(), u, v);
        return vec3.length(crossProduct) > 1e-8;
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

// Obtiene las 4 caras triangulares de un tetraedro compuesto por los vértices v0, v1, v2, v3. 
// https://stackoverflow.com/questions/10612829/tetrahedron-orientation-for-triangle-meshes
// Si se observa la imagen es posible apreciar que v0, v1, v2, forman una cara del poliedro, pero esta se hace a favor de las manecillas del reloj
// Por tanto, v0, v1, v2 deben formar una cara a favor de las manecillas del reloj para que la función genere el orden adecuado para las caras tal
// que sus normales apunten hacia afuera.
// TODO: ver caso donde los vértices están dispuestos de forma distinta en la imagen del tetraedro, a ver si cambia algo.
const tetTriangularFaces = (v0, v1, v2, v3) => [
    [v2, v1, v0],
    [v0, v1, v3],
    [v1, v2, v3],
    [v2, v0, v3]
]

const generateRange = (start, end, step) => {
    const length = Math.floor((end - start) / step) + 1;
    return Array.from({ length }, (_, i) => Number((start + i * step).toFixed(1)));
};

const isWindow = (obj) => {
    return obj !== null && obj === obj.window;
}

const getWindow = (elem) => {
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
}

const offset = (elem) => {
    let box = {top: 0, left: 0};
    const doc = elem && elem.ownerDocument;
    const docElem = doc.documentElement;

    if (typeof elem.getBoundingClientRect !== typeof undefined) {
        box = elem.getBoundingClientRect();
    }
    const win = getWindow(doc);
    return {
        top: box.top + win.pageYOffset - docElem.clientTop,
        left: box.left + win.pageXOffset - docElem.clientLeft
    };
}