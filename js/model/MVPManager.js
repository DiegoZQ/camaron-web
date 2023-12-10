"use strict"

// requires "../external/gl-matrix";
// requires from '../helpers';


class MVPManager {
   constructor(cpuModel) {
      // Canvas
      this.center = null;
      this.modelWidth = null;
      this.modelHeight = null;
      this.modelDepth = null;
      // Movement Vectors/Matrices
      this._translation = vec3.fromValues(0, 0, 0);
      this._scale = vec3.fromValues(1, 1, 1);
      this._rotation = mat4.create();
      // MVP
      this.viewMatrix = null;
      this._viewType = 'perspective';
      this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      this._MV = mat4.create();
      this._MVP = mat4.create();
      this.recalculateMV = true;
      this.recalculateMVP = true;

      this.initModelView(cpuModel);
   }

   // Inicializa los campos para visualizar un modelo, como el centro del modelo y la view Matrix a partir de un cpuModel.
   initModelView(cpuModel) {
      // Set Canvas
      const bounds = cpuModel.bounds;
      this.center = vec3.fromValues(
         (bounds[0] + bounds[3]) / 2,
         (bounds[1] + bounds[4]) / 2,
         (bounds[2] + bounds[5]) / 2
      );
      this.modelWidth = Math.abs(bounds[3] - bounds[0]);
      this.modelHeight = Math.abs(bounds[4] - bounds[1]);
      this.modelDepth = Math.abs(bounds[5] - bounds[2]);
      this.modelDepth = this.modelDepth != 0 ? this.modelDepth: Math.max(this.modelWidth, this.modelHeight);
      // Set View Matrix
      const camera = vec3.fromValues(0, 0, 2*this.modelDepth)
      const target = vec3.fromValues(0, 0, 0)
      const up = vec3.fromValues(0, 1, 0);
      this.viewMatrix = mat4.create()
      mat4.lookAt(this.viewMatrix, camera, target, up);
   }
   
   // Establece una rotación del modelo a partir de una matriz de rotación.
   set rotation(rotationMatrix) {
      this._rotation = rotationMatrix;
      this.recalculateMV = true;
      this.recalculateMVP = true;
   } 

   // Establece una translación del modelo en el plano xy a partir de un vector de translación.
   set translation(translationVector) {
      const xFactor = this.modelWidth/500;
      const yFactor = this.modelHeight/500;
 
      this._translation[0] = translationVector[0] * xFactor;
      this._translation[1] = translationVector[1] * yFactor;
 
      this.recalculateMV = true;
      this.recalculateMVP = true;
   }

   // Establece una escala del modelo a partir de un factor de escala.
   set scale(scaleFactor) {
      this._scale[0] = scaleFactor;
      this._scale[1] = scaleFactor;
      this._scale[2] = scaleFactor;
      this.recalculateMV = true;
      this.recalculateMVP = true;
   }

   // Cambia el aspecto a partir de la resolución de la ventana del cliente.
   updateAspect() {
      this.aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
   }

   // Reescala las matrices que permiten la visualización del modelo debido a una variación de aspecto en el ciente.
   rescale() {
      this.updateAspect();
      this.recalculateMV = true;
      this.recalculateMVP = true;
   }

   // Reinicia la rotación, traslación y escala a valores por defecto, además de reescalar.
   reset() {
      this._translation = vec3.fromValues(0, 0, 0);
      this._rotation = mat4.create();
      this._scale = vec3.fromValues(1, 1, 1);
      this.rescale();
   }

   // Obtiene la matriz del modelo, transladándolo al origen y aplicándole las matrices de escala, translación y rotación.
   get modelMatrix() {
      const modelMatrix = mat4.create();
      const translation = vec3.fromValues(-this.center[0], -this.center[1], -this.center[2]);
    
      mat4.scale(modelMatrix, modelMatrix, this._scale);
      mat4.translate(modelMatrix, modelMatrix, this._translation);
      mat4.multiply(modelMatrix, modelMatrix, this._rotation);
      mat4.translate(modelMatrix, modelMatrix, translation);

      return modelMatrix;
   }

   // Obtiene la Model View Matrix. Si está marcado recalculateMV debido a que previamente se realizaron modificaciones
   // a la MV se recalcula, en caso contrario, simplemente se retorna.
   get MV() {
      if (this.recalculateMV) {
         mat4.multiply(this._MV, this.viewMatrix, this.modelMatrix);
         this.recalculateMV = false;
         this.recalculateMVP = true;
      }
      return this._MV;
   }

   // Obtiene una matriz de proyección ortogonal.
   get orthoProjectionMatrix() {
      const orthoProjectionMatrix = mat4.create();
      const margin = 1.5;
      let width;
      let height;
      if (gl.canvas.clientWidth < gl.canvas.clientHeight) {
         width = this.modelWidth;
         height = this.modelWidth/this.aspect
      } 
      else {
         width = this.modelHeight*this.aspect;
         height = this.modelHeight;
      }
      mat4.ortho(orthoProjectionMatrix, -(width/2)*margin, (width/2)*margin, -(height/2)*margin, (height/2)*margin, 1, this.modelDepth*50)
      return orthoProjectionMatrix;
   }

   // Obtiene una matriz de proyección en perspectiva.
   get perspectiveProjectionMatrix() {
      const perspectiveProjectionMatrix = mat4.create();
      const fieldOfViewRadians = degToRad(60);
      mat4.perspective(perspectiveProjectionMatrix, fieldOfViewRadians, this.aspect, 1, this.modelDepth*50);
      return perspectiveProjectionMatrix;
   }

   // Obtiene una matriz de proyección, ya sea ortogonal o en perspectiva.
   get projectionMatrix() {
      if (this._viewType == "ortho") 
         return this.orthoProjectionMatrix;   
      return this.perspectiveProjectionMatrix;
   }

   // Obtiene la Model View Projection Matrix. Si está marcado recalculateMVP debido a que previamente se realizaron modificaciones
   // a la MVP se recalcula, en caso contrario, simplemente se retorna.
   get MVP() {
      if (this.recalculateMVP) {
         mat4.multiply(this._MVP, this.projectionMatrix, this.MV)
         this.recalculateMVP = false
      }
      return this._MVP;
   }

   // Asigna un nuevo view type (ortogonal o en perspectiva). Si es diferente al actual, marca para recalcular la MVP.
   set viewType(viewType) {
      if (this._viewType != viewType) {
         this._viewType = viewType;
         this.recalculateMV = true;
         this.recalculateMVP = true;
      }
   }
}