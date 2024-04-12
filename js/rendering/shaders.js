"use strict";


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
  } else if (vType == 1.0) {
    gl_PointSize = 10.0;
  }
  type = vType;
}
`;

const pointFragmentShader = `#version 300 es

precision mediump float;

uniform vec4 u_color;

in float type;

uniform sampler2D spriteTexture;

out vec4 outColor;

void main() {
  if (type == 0.0) {
    // Regular vertex, apply regular rendering logic
    outColor = u_color;
  } else if (type == 1.0) {
    // Hole, apply hole rendering logic
    outColor = texture(spriteTexture, gl_PointCoord);
    outColor.rgb *= outColor.a;
  }
}
`;