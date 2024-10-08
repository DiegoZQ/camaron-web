"use strict";


const defaultColorConfig = {
    baseColor: vec4.fromValues(0.7, 0.7, 0.7, 1),
	selectedColor: vec4.fromValues(0.7, 0.2, 0.2, 1),
	wireFrameColor: vec4.fromValues(0, 0, 0, 1),
	faceNormalColor: vec4.fromValues(0.145, 0.619, 0.109, 1),
	vertexNormalColor: vec4.fromValues(1, 0, 0, 1),
	vertexCloudColor: vec4.fromValues(0, 0, 1, 1),
    faceIdColor: vec4.fromValues(0.34, 0.55, 0.61, 1),
    vertexIdColor: vec4.fromValues(0.54, 0.23, 0.42, 1)
}

const defaultBackgroundColor = document.getElementById("model-view").style.backgroundColor;

const colorConfig = {
    baseColor: vec4.fromValues(0.7, 0.7, 0.7, 1),
	selectedColor: vec4.fromValues(0.7, 0.2, 0.2, 1),
	wireFrameColor: vec4.fromValues(0, 0, 0, 1),
	faceNormalColor: vec4.fromValues(0.145, 0.619, 0.109, 1),
	vertexNormalColor: vec4.fromValues(1, 0, 0, 1),
	vertexCloudColor: vec4.fromValues(0, 0, 1, 1),
    faceIdColor: vec4.fromValues(0.34, 0.55, 0.61, 1),
    vertexIdColor: vec4.fromValues(0.54, 0.23, 0.42, 1)
};

const colorMap = {
    baseColor: "face_color",
    selectedColor: "selected_face_color",
    wireFrameColor: "wireframe_color",
    faceNormalColor: "face_normals_color",
    vertexNormalColor: "vertex_normals_color",
    vertexCloudColor: "vertex_cloud_color",
    faceIdColor: "face_id_color",
    vertexIdColor: "vertex_id_color"
}

const inverseColorMap = Object.entries(colorMap).reduce((acc, [key, value]) => (acc[value] = key, acc), {});

const fontInfo = {
    letterWidth: 242,
    letterHeight: 310,
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