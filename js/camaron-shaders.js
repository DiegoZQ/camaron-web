// VERTEX SHADERS

var normalVertexShader = `#version 300 es

in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

out vec3 v_normal;

void main() {
  gl_Position = u_worldViewProjection * a_position;
  v_normal = mat3(u_world) * a_normal;
}
`;

var normalFragmentShader = `#version 300 es

precision mediump float;

in vec3 v_normal;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

out vec4 outColor;

void main() {
  vec3 normal = normalize(v_normal);
  float light = dot(normal, u_reverseLightDirection);

  outColor = u_color;
  outColor.rgb *= light;
}
`;

var basicVertexShader = `#version 300 es

in vec4 a_position;

uniform mat4 u_worldViewProjection;

void main() {
  gl_Position = u_worldViewProjection * a_position;
}
`;

var basicFragmentShader = `#version 300 es

precision mediump float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`;
