"use strict";

// requires "./SecondaryRenderer";
// requires "../shaders";
// requires "../../config";


class TextureRenderer extends SecondaryRenderer {
	
    // Loads a texture from the html using an id and a position in the texture array to save it.
	loadTexture(textureId, position) {
		const icon = document.getElementById(textureId);
		const glTexture = gl.createTexture();
		gl.activeTexture(33984 + position); 
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, icon);
		gl.generateMipmap(gl.TEXTURE_2D);
		
		const textureAttributeLocation = gl.getUniformLocation(this.program, 'u_texture');
		gl.uniform1i(textureAttributeLocation, position);
	}
}