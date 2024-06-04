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

// Obtiene las 4 caras triangulares de un tetraedro compuesto por los vértices v0, v1, v2, v3. 
// https://stackoverflow.com/questions/10612829/tetrahedron-orientation-for-triangle-meshes
const tetTriangularFaces = (v0, v1, v2, v3) => [
    [v2, v1, v0],
    [v0, v1, v3],
    [v1, v2, v3],
    [v2, v0, v3]
]

const generateRange = (start, end, step) => {
    const length = Math.floor((end - start) / step) + 1;

    // Create the range using Array.from
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
