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
    letterWidth: 242,
    letterHeight: 310,
    spaceWidth: 8,
    spacing: -1,
    textureWidth: 1685,
    textureHeight: 1338,
    glyphInfos: {
        '0': { x: 453, y: 1028 },
        '1': { x: 0, y: 3 },
        '2': { x: 452, y: 3 },
        '3': { x: 936, y: 3 },
        '4': { x: 1409, y: 3 },
        '5': { x: 0, y: 515 },
        '6': { x: 453, y: 515 },
        '7': { x: 936, y: 515 },
        '8': { x: 1409, y: 515 },
        '9': { x: 0, y: 1028 }
    },
};

const fontInfo2 = {
    letterWidth: 8,
    letterHeight: 8,
    spaceWidth: 8,
    spacing: -1,
    textureWidth: 64,
    textureHeight: 40,
    glyphInfos: {
        '0': { x: 16, y: 24},
        '1': { x: 24, y: 24 },
        '2': { x: 32, y: 24 },
        '3': { x: 40, y: 24 },
        '4': { x: 48, y: 24 },
        '5': { x: 56, y: 24 },
        '6': { x:  0, y: 32 },
        '7': { x:  8, y: 32 },
        '8': { x: 16, y: 32 },
        '9': { x: 24, y: 32 }
    },
};