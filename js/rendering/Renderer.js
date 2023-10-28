"use strict";


class Renderer {
   constructor(rModel) {
      this.rModel = rModel;
      this.vao = gl.createVertexArray(); // Vertex Array Object: se utiliza para agrupar las configuraciones de atributos de vértice
   }

   // Una vez inicializado el vao (gl.bindVertexArray(this.vao)), asigna un buffer cargado con floats a una variable dentro de un shader.
   setupAttributePointer(attributeLocation, buffer) {
      gl.enableVertexAttribArray(attributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(attributeLocation, 3, gl.FLOAT, false, 0, 0);
   }

   // Una vez inicializado el vao (gl.bindVertexArray(this.vao)) y asignado variables dentro de este (setupAttributePointer(attributeLocation, buffer)),
   // renderiza el RModel aplicando culling (ie solo renderiza lo visible por la cámara).
   renderWithCulling(reverseLightDirectionLocation = null, lightDirection = null) {
      gl.cullFace(gl.BACK);
      if (reverseLightDirectionLocation && lightDirection) 
    	      gl.uniform3fv(reverseLightDirectionLocation, lightDirection);
		gl.drawArrays(gl.TRIANGLES, 0, this.rModel.trianglesCount*3);

      gl.cullFace(gl.FRONT);
      if (reverseLightDirectionLocation && lightDirection) 
         gl.uniform3fv(reverseLightDirectionLocation, vec3.negate(lightDirection, lightDirection));
      gl.drawArrays(gl.TRIANGLES, 0, this.rModel.trianglesCount*3);
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

export default Renderer;