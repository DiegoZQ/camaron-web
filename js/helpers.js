"use strict";


/*--------------------------------------------------------------------------------------
---------------------------------------- HELPERS ---------------------------------------
----------------------------------------------------------------------------------------

These are helper functions that were not in any of the previous categories.
--------------------------------------------------------------------------------------*/
export const degToRad = (d) => {
    return d * Math.PI / 180;
}
  
export const radToDeg = (d) => {
    return d * 180 / Math.PI;
}
 
export const resizeCanvas = (canvas) => {
    const width  = canvas.clientWidth*2;
    const height = canvas.clientHeight*2;
    if(width > height) {
      canvas.width  = width;
      canvas.height = width/2;
    }
    else {
      canvas.width  = height*2;
      canvas.height = height;
    }
}

// Obtiene un arreglo con todas las palabras contenidas en un string
export const getLineWords = (line) => {
    return line.match(/\S+/);
}