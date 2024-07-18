"use strict";


const parseRGB = (rgbString) => {
    // Remove "rgb(" and ")" from the string, and split the remaining string by commas
    const rgbValues = rgbString.substring(4, rgbString.length - 1).split(',');

    // Convert the string values to numbers and return them as an array
    return rgbValues.map(value => parseInt(value.trim(), 10));
}

// Convierte un valor de defaultColorConfig o colorConfig usando su key, a su formato
// rgb css. Ej: (1,1,1,1) => rgb(255,255,255)
const parseVectorToRGB = (vector) => {
    const rgbValues = vector.slice(0,3).map(value => parseInt(value*255));
    return `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`;
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
    return [H, S, L].map(value => Math.round(value + 0.05));
}