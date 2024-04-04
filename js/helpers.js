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