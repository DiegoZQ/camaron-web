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
   setupAttributePointer(attributeLocation, buffer) {
      gl.enableVertexAttribArray(attributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(attributeLocation, 3, gl.FLOAT, false, 0, 0);
   }

  init() {
      // ...
   }   

   draw() {
	   // ...
   }

   updateColor() {
	   // ...
   }
}