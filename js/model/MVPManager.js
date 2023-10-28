"use strict"

import { vec3, mat4 } from "../external/gl-matrix";
import { degToRad } from '../helpers';


class MVPManager {
   constructor(model) {
      // Canvas
      this.center = null;
      this.modelWidth = null;
      this.modelHeight = null;
      this.modelDepth = null;
      // Movement Vectors/Matrices
      this.translation = vec3.fromValues(0, 0, 0);
      this.scale = vec3.fromValues(1, 1, 1);
      this.rotation = mat4.create();
      // MVP
      this.modelMatrix = null;
      this.viewMatrix = null;
      this.viewType = 'perspective';
      this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      this.MV = mat4.create();
      this.MVP = mat4.create();
      this.recalculateMV = true;
      this.recalculateMVP = true;
      this.loadDataFromModel(model);
   }

   getModelHeight() {
      return this.modelHeight;
   }

   // Translada el modelo al orígen y asigna una cámara que lo mira a una distancia el doble del modelo en el eje z.
   loadDataFromPolygonMesh(model) {
      // Set Canvas
      const bounds = model.getBounds();
      this.center = vec3.fromValues(
         (bounds[0] + bounds[3]) / 2,
         (bounds[1] + bounds[4]) / 2,
         (bounds[2] + bounds[5]) / 2
      );
      this.modelWidth = Math.abs(bounds[3] - bounds[0]);
      this.modelHeight = Math.abs(bounds[4] - bounds[1]);
      this.modelDepth = Math.abs(bounds[5] - bounds[2]);
      // Set Model Matrix
      const translation = vec3.fromValues(-this.center[0], -this.center[1], -this.center[2]);
      this.modelMatrix = mat4.create();
      mat4.translate(this.modelMatrix, this.modelMatrix, translation);
      // Set View Matrix
      const camera = vec3.fromValues(0, 0, this.modelDepth*2)
      const target = vec3.fromValues(0, 0, 0)
      const up = vec3.fromValues(0, 1, 0);
      this.viewMatrix = mat4.create()
      mat4.lookAt(this.viewMatrix, camera, target, up);
   }
   
   loadDataFromModel(model) {
      if (model.modelType == "PolygonMesh")
         this.loadDataFromPolygonMesh();
   }

   // Obtiene el centro x, y, z de un modelo.
   getCenter(model) {
      const bounds = model.getBounds();
      const center = vec3.fromValues(
         (bounds[0] + bounds[3]) / 2,
         (bounds[1] + bounds[4]) / 2,
         (bounds[2] + bounds[5]) / 2
      );
      return center;
   }

   // Establece una rotación del modelo a partir de una matriz de rotación.
   setRotation(rotationMatrix) {
      this.rotation = rotationMatrix;
      this.recalculateMV = true;
      this.recalculateMVP = true;
   } 

   // Establece una translación del modelo en el plano xy a partir de un vector de translación.
   setTranslation(translationVector) {
      const xFactor = this.modelWidth/500;
      const yFactor = this.getModelHeight()/500;
 
      this.translation[0] = translationVector[0] * xFactor;
      this.translation[1] = translationVector[1] * yFactor;
 
      this.recalculateMV = true;
      this.recalculateMVP = true;
   }

   // Establece una escala del modelo a partir de un factor de escala.
   setScale(scaleFactor) {
      this.scale[0] = scaleFactor;
      this.scale[1] = scaleFactor;
      this.scale[2] = scaleFactor;
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
      this.translation = vec3.fromValues(0, 0, 0);
      this.rotation = mat4.create();
      this.scale = vec3.fromValues(1, 1, 1);
      this.rescale();
   }

   // Obtiene la matriz del modelo, transladándolo al origen y aplicándole las matrices de escala, translación y rotación.
   getModelMatrix() {
      const modelMatrix = mat4.create();
      const translation = vec3.fromValues(-this.center[0], -this.center[1], -this.center[2]);
    
      mat4.scale(modelMatrix, modelMatrix, this.scale);
      mat4.translate(modelMatrix, modelMatrix, this.translation);
      mat4.multiply(modelMatrix, modelMatrix, this.rotation);
      mat4.translate(modelMatrix, modelMatrix, translation);

      return modelMatrix;
   }

   // Obtiene la Model View Matrix. Si está marcado recalculateMV debido a que previamente se realizaron modificaciones
   // a la MV se recalcula, en caso contrario, simplemente se retorna.
   getMV() {
      if (this.recalculateMV) {
         mat4.multiply(this.MV, this.viewMatrix, this.getModelMatrix());
         this.recalculateMV = false;
         this.recalculateMVP = true;
      }
      return this.MV;
   }

   // Obtiene una matriz de proyección ortogonal.
   getOrthoProjectionMatrix() {
      const orthoProjectionMatrix = mat4.create();
      const margin = 1.5;
      let width;
      let height;
      if (gl.canvas.clientWidth < gl.canvas.clientHeight) {
         width = this.modelWidth;
         height = this.modelWidth/this.aspect
      } 
      else {
         width = this.getModelHeight()*this.aspect;
         height = this.getModelHeight();
      }
      mat4.ortho(orthoProjectionMatrix, -(width/2)*margin, (width/2)*margin, -(height/2)*margin, (height/2)*margin, 1, this.modelDepth*50)
      return orthoProjectionMatrix;
   }

   // Obtiene una matriz de proyección en perspectiva.
   getPerspectiveProjectionMatrix() {
      const perspectiveProjectionMatrix = mat4.create();
      const fieldOfViewRadians = degToRad(60);
      mat4.perspective(perspectiveProjectionMatrix, fieldOfViewRadians, this.aspect, 1, this.modelDepth*50);
      return perspectiveProjectionMatrix;
   }

   // Obtiene una matriz de proyección, ya sea ortogonal o en perspectiva.
   getProjectionMatrix() {
      if (this.viewType == "ortho") 
         return this.getOrthoProjectionMatrix();   
      return this.getPerspectiveProjectionMatrix();
   }

   // Obtiene la Model View Projection Matrix. Si está marcado recalculateMVP debido a que previamente se realizaron modificaciones
   // a la MVP se recalcula, en caso contrario, simplemente se retorna.
   getMVP() {
      if (this.recalculateMVP) {
         mat4.multiply(this.MVP, this.getProjectionMatrix(), this.getMV())
         this.recalculateMVP = false
      }
      return this.MVP;
   }

   // Asigna un nuevo view type (ortogonal o en perspectiva). Si es diferente al actual, marca para recalcular la MVP.
   setViewType(viewType) {
      if (this.viewType != viewType) {
         this.viewType = viewType;
         this.recalculateMV = true;
         this.recalculateMVP = true;
      }
   }
}

export default MVPManager;