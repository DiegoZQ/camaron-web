"use strict";

// https://stackoverflow.com/questions/50815380/webgl-how-to-handle-drawing-order-in-3d
// TODO: VER COMO SE RENDERIZA BIEN LA LUZ CUANDO ESTOY MIRANDO UN POLÍGONO CUYA NORMAL NO APUNTA DESDE DONDE MIRO
// NORMAL PROGRAM
const normalVertexShader = `#version 300 es

in vec4 a_position;
in vec3 a_normal;
in vec4 a_color;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

out vec3 v_normal;
out vec4 v_color;

void main() {
  gl_Position = u_worldViewProjection * a_position;
  v_normal = mat3(u_world) * a_normal;
  v_color = a_color;
}
`;

const normalFragmentShader = `#version 300 es

precision mediump float;

in vec3 v_normal;
in vec4 v_color;

uniform vec3 u_reverseLightDirection;

out vec4 outColor;

void main() {
  vec3 normal = normalize(v_normal);
  float light = dot(normal, u_reverseLightDirection);
  if (v_color.a <= 0.5) discard;
  outColor = v_color;
  outColor.rgb *= light;
}
`;


// BASIC PROGRAM
const basicVertexShader = `#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_worldViewProjection;

out vec4 v_color;

void main() {
  gl_Position = u_worldViewProjection * a_position;
  v_color = a_color;
}
`;

const basicFragmentShader = `#version 300 es

precision mediump float;

in vec4 v_color;

out vec4 outColor;

void main() {
  if (v_color.a <= 0.5) discard;
  outColor = v_color;
}
`;


//SINGLE COLOR PROGRAM
const sCVertexShader = `#version 300 es

in vec4 a_position;

uniform mat4 u_worldViewProjection;


void main() {
  gl_Position = u_worldViewProjection * a_position;
}
`;

const sCFragmentShader = `#version 300 es

precision mediump float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`;


//POINT PROGRAM
const pointVertexShader = `#version 300 es

in vec4 a_position;
in float vType;

uniform mat4 u_worldViewProjection;

out float type; 

void main() {
  gl_Position = u_worldViewProjection * a_position;
  if (vType == 0.0) {
    gl_PointSize = 5.0;
  } else {
    gl_PointSize = 10.0;
  }
  type = vType;
}
`;

const pointFragmentShader = `#version 300 es

precision mediump float;

uniform vec4 u_color;

in float type;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  if (type == 0.0) {
    // Regular vertex, apply regular rendering logic
    outColor = u_color;
  } else {
    // Hole, apply hole rendering logic
    outColor = texture(u_texture, gl_PointCoord);
    outColor.rgb *= outColor.a;
  }
}
`;

// VERTEX SHADER: http://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/billboards/
// BLENDING PROBLEM: https://stackoverflow.com/questions/59205157/why-are-the-transparent-pixels-not-blending-correctly-in-webgl
// VERTEX SHAMDER 2: https://www.chinedufn.com/webgl-particle-effect-billboard-tutorial/
const billboardVertexShader = `#version 300 es

in vec2 a_position;
in vec3 a_center;
in vec2 a_texcoord;

uniform float font_scale;
uniform float scale;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_worldView;

out vec2 v_texcoord;

void main() {
  vec3 camera_right = vec3(u_view[0][0], u_view[1][0], u_view[2][0]);
  vec3 camera_up = vec3(u_view[0][1], u_view[1][1], u_view[2][1]);

  vec3 position = (u_worldView * vec4(a_center, 1.0)).xyz;

  // Direction from vertex position to the camera (always at the origin)
  vec3 cameraDir = normalize(-position);
  
  // Translate the vertex position towards the camera a specific distance
  position += cameraDir * font_scale * scale * 400.0;
  //position += cameraDir * font_scale * scale * 10.0;

  // Translate the vertex from the center to its relative position (a_position) in the billboard
  position += (camera_right * a_position.x * scale) + (camera_up * a_position.y * scale);
  gl_Position = u_projection * vec4(position, 1.0);

  v_texcoord = a_texcoord;
}
`;

// BLENDING PROBLEM 2: https://stackoverflow.com/questions/7067492/sprite-quads-depth-testing-correctly-in-opengl-es-2
const billboardFragmentShader = `#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  vec4 texColor = texture(u_texture, v_texcoord);
  if (texColor.a <= 0.5) discard;
  outColor = texColor;
  outColor.rgb *= outColor.a;
}
`;


const cuttingPlaneVertexShader = `#version 300 es

in vec4 a_position;

uniform vec3 u_translation;
uniform mat4 u_worldViewProjection;

void main() {
  gl_Position = u_worldViewProjection * vec4(a_position.xyz + u_translation, 1.0);
}
`;

const cuttingPlaneFragmentShader = `#version 300 es

precision mediump float;
out vec4 outColor;

void main() {
  outColor = vec4(0.0, 0.84, 0.9, 0.3);
}
`;