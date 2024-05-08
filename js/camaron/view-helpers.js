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

   verticesInfo.innerHTML = `Vertices: ${model.vertices.length}`;
   polygonsInfo.innerHTML = `Polygons: ${model.polygons?.length}`;
   widthInfo.innerHTML = `Width: ${Math.round(model.modelWidth)}`;
   heightInfo.innerHTML = `Height: ${Math.round(model.modelHeight)}`;
   depthInfo.innerHTML = `Depth: ${Math.round(model.modelDepth)}`;
   scaleInfo.value = scalator.scaleFactor.toFixed(1);
};
  
// Creates a main renderer and assigns it to the main renderer variable.
const setMainRenderer = (renderer=null) => {
   if (!model || !mvpManager)
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
      mainRenderer = new RendererClass(mvpManager, model);
      mainRenderer.init();
   } else {
      mainRenderer = null;
   }
}

// Creates a new list of  every secondary renderer selected created and 
// adds it to the secondary renderers variable.
const setSecondaryRenderers = () => {
   if (!model || !mvpManager)
      return;

   secondaryRenderers = [];
   const elements = Array.from(document.querySelectorAll('[name="secondary_renderer"].active'));
   const rendererMap = {
      "wireframe_renderer": WireRenderer,
      "vertex_normals_renderer": VNormalsRenderer,
      "face_normals_renderer": FNormalsRenderer,
      "vertex_cloud_renderer": VCloudRenderer,
      "vertex_id_renderer": VertexIdRenderer,
      "face_id_renderer": FaceIdRenderer,
   };

   for (const element of elements) {
      const RendererClass = rendererMap[element?.id]
      if (RendererClass) {
         const secondaryRenderer = new RendererClass(mvpManager, model);
         secondaryRenderer.init();
         secondaryRenderers.push(secondaryRenderer);
      } 
   }
}

// Changes the viewtype between perspective and orthogonal.
const changeViewType = (viewType=null) => {
   if (!mvpManager)
      return;
   
   if (!viewType) {
      const sceneElement = document.querySelector("[name='view_type'] .scene");
      viewType = Array.from(sceneElement.classList).find(className => className !== 'scene');
   }
   mvpManager.viewType = viewType;
}

// Changes the viewtype between perspective and orthogonal.
const setUIStartConfiguration = () => {
   if (!model || !model.loaded) {
      return;
   }
   const mainRenderers = document.querySelectorAll('a[name="main_renderer"]');
   const secondaryRenderers = document.querySelectorAll('li[name="secondary_renderer"]');
   const renderers = [...mainRenderers, ...secondaryRenderers];
   const exportsMenu = document.getElementById('exports_menu');
   const screenshootButton = document.getElementById('screenshot_button');
   const secondaryRenderersMenu = document.getElementById('secondary_renderers_menu');

   exportsMenu.classList.remove('disabled');
   screenshootButton.classList.remove('disabled');   
   secondaryRenderersMenu.classList.remove('disabled'); 

   for (const renderer of renderers) {
      if (!model.availableRenderers.includes(renderer.id)) {
         renderer.classList.add('disabled');
      } else {
         renderer.classList.remove('disabled');
      }
      if (model.activeRenderers.includes(renderer.id)) {
         renderer.classList.add('active');
      } else {
         renderer.classList.remove('active');
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
   mvpManager.reset();
   draw();
}

// Rescales the model when the canvas changes size.
const rescaleView = () => {

   if (rotator == undefined || translator == undefined)
      return;
  
   rotator.rescale();
   translator.rescale();
   scalator.rescale();
   mvpManager.rescale();
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