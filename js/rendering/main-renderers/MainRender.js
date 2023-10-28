"use strict";

import Renderer from "../Renderer";


class MainRenderer extends Renderer {
	constructor(rModel, vertexShader, fragmentShader) {
	   super(rModel, vertexShader, fragmentShader);
	   this.colorBuffer = null;
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

	updateColor() {
		// Modifica el valor del color buffer con información actualizada de la color matrix del RModel
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.rModel.colorMatrix, gl.STATIC_DRAW);

		// Asigna el valor del color buffer dentro de las variables a_color
		this.setupAttributePointer(this.colorAttributeLocation, this.colorBuffer);
	}
}

export default MainRenderer;