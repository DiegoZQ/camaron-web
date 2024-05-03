"use strict";


const defaultColorConfig = {
    baseColor: vec4.fromValues(0.7, 0.7, 0.7, 1),
	selectedColor: vec4.fromValues(0.7, 0.2, 0.2, 1),
	wireFrameColor: vec4.fromValues(0, 0, 0, 1),
	faceNormalColor: vec4.fromValues(0.145, 0.619, 0.109, 1),
	vertexNormalColor: vec4.fromValues(1, 0, 0, 1),
	vertexCloudColor: vec4.fromValues(0, 0, 1, 1),
}

const defaultBackgroundColor = document.getElementById("model-view").style.backgroundColor;

const colorConfig = {
    baseColor: vec4.fromValues(0.7, 0.7, 0.7, 1),
	selectedColor: vec4.fromValues(0.7, 0.2, 0.2, 1),
	wireFrameColor: vec4.fromValues(0, 0, 0, 1),
	faceNormalColor: vec4.fromValues(0.145, 0.619, 0.109, 1),
	vertexNormalColor: vec4.fromValues(1, 0, 0, 1),
	vertexCloudColor: vec4.fromValues(0, 0, 1, 1)
};

const fontInfo = {
    letterHeight: 8,
    spaceWidth: 8,
    spacing: -1,
    textureWidth: 64,
    textureHeight: 40,
    width: 8,
    glyphInfos: {
        '0': { x: 16, y: 24, width: 8, },
        '1': { x: 24, y: 24, width: 8, },
        '2': { x: 32, y: 24, width: 8, },
        '3': { x: 40, y: 24, width: 8, },
        '4': { x: 48, y: 24, width: 8, },
        '5': { x: 56, y: 24, width: 8, },
        '6': { x:  0, y: 32, width: 8, },
        '7': { x:  8, y: 32, width: 8, },
        '8': { x: 16, y: 32, width: 8, },
        '9': { x: 24, y: 32, width: 8, }
    },
};