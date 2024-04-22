"use strict";

// requires "../../external/webgl-utils";


class Renderer {
   constructor(gpuModel, vertexShader, fragmentShader) {
      this.gpuModel = gpuModel;
      this.program = webglUtils.createProgramFromSources(gl, [vertexShader, fragmentShader]);
      this.vao = gl.createVertexArray(); // Vertex Array Object: se utiliza para agrupar las configuraciones de atributos de vértice
      this.positionBuffer = null;
	   this.positionAttributeLocation = null;
	   this.colorAttributeLocation = null;
	   this.MVPLocation = null;
   }

   // Una vez inicializado el vao (gl.bindVertexArray(this.vao)), asigna un buffer cargado con floats a una variable dentro de un shader.
   setupAttributePointer(attributeLocation, buffer, size=3, stride=0, offset=0) {
      gl.enableVertexAttribArray(attributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, stride, offset);
   }

  init() {
      // ...
   }   

   draw() {
	   // ...
   }
}