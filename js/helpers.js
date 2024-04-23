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

const isPercentage = (n) => {
    return typeof n === "string" && n.indexOf('%') != -1;
}

const isOnePointZero =(n) => {
    return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
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

// Retorna un número si está dentro de un rango min-max, si es menor a min, retorna min y si es
// mayor a max retorna max.
const segmentNumber = (number, min, max) => {
    return Math.max(min, Math.min(number, max));
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

const bound01 = (n, max) => {
    if (isOnePointZero(n)) { n = "100%"; }

    const processPercent = isPercentage(n);
    n = Math.min(max, Math.max(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if ((Math.abs(n - max) < 0.000001)) {
        return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return (n % max) / parseFloat(max);
}

const parseRGB = (rgbString) => {
    // Remove "rgb(" and ")" from the string, and split the remaining string by commas
    const rgbValues = rgbString.substring(4, rgbString.length - 1).split(',');

    // Convert the string values to numbers and return them as an array
    return rgbValues.map(value => parseInt(value.trim(), 10));
}

// RGB - HEX
const rgbToHex = (red, green, blue) => {
    const rgb = blue | (green << 8) | (red << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1);
}
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// RGB - HSL
const rgbToHsl = (rgbArr) => {
    const r1 = rgbArr[0] / 255;
    const g1 = rgbArr[1] / 255;
    const b1 = rgbArr[2] / 255;
 
    const maxColor = Math.max(r1,g1,b1);
    const minColor = Math.min(r1,g1,b1);
    //Calculate L:
    let L = (maxColor + minColor) / 2 ;
    let S = 0;
    let H = 0;
    if (maxColor !== minColor){
        //Calculate S:
        if (L < 0.5){
            S = (maxColor - minColor) / (maxColor + minColor);
        } else {
            S = (maxColor - minColor) / (2.0 - maxColor - minColor);
        }
        //Calculate H:
        if (r1 == maxColor) {
            H = (g1-b1) / (maxColor - minColor);
        }else if (g1 == maxColor) {
            H = 2.0 + (b1 - r1) / (maxColor - minColor);
        } else {
            H = 4.0 + (r1 - g1) / (maxColor - minColor);
        }
    }
 
    L = L * 100;
    S = S * 100;
    H = H * 60;
    if (H < 0) {
        H += 360;
    }
    return [H, S, L];
}
const hslToRgb = (h, s, l) => {
    let r, g, b;

    h = bound01(h, 360);
    s = bound01(s, 100);
    l = bound01(l, 100);

    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    if(s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [r * 255, g * 255, b * 255];
}

// RGB - HSV
const rgbToHsv = (r, g, b) => {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h;
    const s = (max === 0 ? 0 : d / max);
    const v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return [h, s, v];
}