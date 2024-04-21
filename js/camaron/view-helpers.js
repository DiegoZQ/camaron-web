"use strict";

// requires "../rendering/main-renderers/DirectFaceRenderer";
// requires "../rendering/main-renderers/DirectVertexRenderer";
// requires "../rendering/main-renderers/FlatRenderer";
// requires "../rendering/secondary-renderers/WireRenderer";
// requires "../rendering/secondary-renderers/VNormalsRenderer";
// requires "../rendering/secondary-renderers/FNormalsRenderer";
// requires "../rendering/secondary-renderers/VCloudRenderer";


/*--------------------------------------------------------------------------------------
------------------------------------- VIEW HELPERS -------------------------------------
----------------------------------------------------------------------------------------

These functions are used for setting and updating different aspects of the view or the model.
These are often used by buttons on the same view, or by other methods.
--------------------------------------------------------------------------------------*/

// Updates the visible information of the model when is loaded.
const updateInfo = () => {
   const verticesInfo = document.getElementById("vertices_info");
   const polygonsInfo = document.getElementById("polygons_info");
   const widthInfo = document.getElementById("width_info");
   const heightInfo = document.getElementById("height_info");
   const depthInfo = document.getElementById("depth_info");

   verticesInfo.innerHTML = `Vertices: ${cpuModel.vertices.length}`;
   polygonsInfo.innerHTML = `Polygons: ${cpuModel.polygons?.length}`;
   widthInfo.innerHTML = `Width: ${Math.round(gpuModel.MVPManager.modelWidth)}`;
   heightInfo.innerHTML = `Height: ${Math.round(gpuModel.MVPManager.modelHeight)}`;
   depthInfo.innerHTML = `Depth: ${Math.round(gpuModel.MVPManager.modelDepth)}`;
   scaleInfo.value = scalator.scaleFactor.toFixed(1);
};
  
// Creates a main renderer and assigns it to the main renderer variable.
const setMainRenderer = (renderer=null) => {
   if (!gpuModel)
      return;

   if (!renderer) 
      renderer = document.querySelector('a[name="main_renderer"].active');

   const rendererMap = {
      "face_renderer": DirectFaceRenderer,
      "vertex_renderer": DirectVertexRenderer,
      "flat_renderer": FlatRenderer,
   };

   const RendererClass = rendererMap[renderer?.id]
   if (RendererClass) {
      mainRenderer = new RendererClass(gpuModel);
      mainRenderer.init();
   } else {
      mainRenderer = null;
   }
}

// Creates a new list of  every secondary renderer selected created and 
// adds it to the secondary renderers variable.
const setSecondaryRenderers = () => {
   if (!gpuModel)
      return;

   secondaryRenderers = [];
   const elements = Array.from(document.querySelectorAll('[name="secondary_renderer"].active'));
   const rendererMap = {
      "wireframe_renderer": WireRenderer,
      "vertex_normals_renderer": VNormalsRenderer,
      "face_normals_renderer": FNormalsRenderer,
      "vertex_cloud_renderer": VCloudRenderer,
      //"vertex_id_renderer": VertexIdRenderer
   };

   for (const element of elements) {
      const RendererClass = rendererMap[element?.id]
      if (RendererClass) {
         const secondaryRenderer = new RendererClass(gpuModel);
         secondaryRenderer.init();
         secondaryRenderers.push(secondaryRenderer);
      } 
   }
}

// Changes the viewtype between perspective and orthogonal.
const changeViewType = (viewType=null) => {
   if (!gpuModel)
      return;
   
   if (!viewType) {
      const sceneElement = document.querySelector("[name='view_type'] .scene");
      viewType = Array.from(sceneElement.classList).find(className => className !== 'scene');
   }
   gpuModel.MVPManager.viewType = viewType;
}

// Changes the viewtype between perspective and orthogonal.
const setUIStartConfiguration = () => {
   if (!gpuModel || !gpuModel.loaded) {
      return;
   }
   const mainRenderers = document.querySelectorAll('a[name="main_renderer"]');
   const secondaryRenderers = document.querySelectorAll('li[name="secondary_renderer"]');
   const renderers = [...mainRenderers, ...secondaryRenderers];

   // Clean up previous configuration
   for (const renderer of renderers) {
      if (renderer.classList.contains('active')) {
         renderer.classList.remove('active');
      }
      if (renderer.classList.contains('disabled')) {
         renderer.classList.remove('disabled');
      }
   }
   if (['PolygonMesh', 'PolyhedronMesh'].includes(gpuModel.cpuModel.modelType)) {
      // Make all renderers available and activate face_renderer.
      const mainRenderer = document.getElementById('face_renderer');
      mainRenderer.classList.add('active');
   } else {
      // Disable all main renderers except for 'none_renderer'
      for (const renderer of mainRenderers) {
         if (renderer.id !== 'none_renderer') {
            renderer.classList.add('disabled');
         } else {
            renderer.classList.add('active');
         }
      }
      // Determine available secondary renderers based on model type
      let availableRendererIds;
      if (gpuModel.cpuModel.modelType === 'PSLG') {
         availableRendererIds = ['wireframe_renderer', 'vertex_cloud_renderer'];
      } else if (gpuModel.cpuModel.modelType === 'VertexCloud') {
         availableRendererIds = ['vertex_cloud_renderer'];
      }
      // Disable secondary renderers that are not in availableRendererIds
      // and activate the ones that are in the list
      for (const renderer of secondaryRenderers) {
         if (!availableRendererIds.includes(renderer.id)) {
            renderer.classList.add('disabled');
         } else {
            renderer.classList.add('active');
         }
      }
   }
}

// Resets the model to its original position.
const resetView = () => {

   if (rotator == undefined || translator == undefined)
      return;

   rotator.reset();
   translator.reset();
   scalator.reset();
   scaleInfo.value = scalator.scaleFactor.toFixed(1);
   gpuModel.MVPManager.reset();
   draw();
}

// Rescales the model when the canvas changes size.
const rescaleView = () => {

   if (rotator == undefined || translator == undefined)
      return;
  
   rotator.rescale();
   translator.rescale();
   scalator.rescale();
   gpuModel.MVPManager.rescale();
   draw();
} 

// Enables or disables every button with the dependant class
const switchClassDependant = (className, mode) => {
   let operation;

   if (mode === 'disable') 
      operation = (element) => element.classList.add('disabled');
   else if (mode == 'enable') 
      operation = (element) => element.classList.remove('disabled');
   else
      return;

   const elements = document.getElementsByClassName(className);

   for (const element of elements) 
      operation(element);
}

// Enables every disabled button with the model dependant class
const enableModelDependant = () => {
   switchClassDependant('model-d', 'enable');
}
  
  // Enables every disabled button with the evaluation dependant class
const enableEvaluationDependant = () => {
   switchClassDependant('eval-d', 'enable');
}
  
const disableEvaluationDependant = () => {
   switchClassDependant('eval-d', 'disable');
}

const resizeCanvas = (canvas) => {
   const width  = canvas.clientWidth * 2;
   const height = canvas.clientHeight * 2;
   if (width > height) {
      canvas.width  = width;
      canvas.height = width/2;
   } else {
      canvas.width  = height*2;
      canvas.height = height;
   }
}