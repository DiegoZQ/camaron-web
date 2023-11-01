import DirectFaceRenderer from "../rendering/main-renderers/DirectFaceRenderer";
import DirectVertexRenderer from "../rendering/main-renderers/DirectVertexRenderer";
import FlatRenderer from "../rendering/main-renderers/FlatRenderer";
import WireRenderer from "../rendering/secondary-renderers/WireRenderer";
import VNormalsRenderer from "../rendering/secondary-renderers/VNormalsRenderer";
import FNormalsRenderer from "../rendering/secondary-renderers/FNormalsRenderer";
import VCloudRenderer from "../rendering/secondary-renderers/VCloudRenderer";


/*--------------------------------------------------------------------------------------
------------------------------------- VIEW HELPERS -------------------------------------
----------------------------------------------------------------------------------------

These functions are used for setting and updating different aspects of the view or the model.
These are often used by buttons on the same view, or by other methods.
--------------------------------------------------------------------------------------*/

// Updates the visible information of the model when is loaded.
export const updateInfo = (globalVars) => {
   const cpuModel = globalVars.cpuModel;
   const gpuModel = globalVars.gpuModel;
   const scalator = globalVars.scalator;
   const scaleInfo = globalVars.scaleInfo;

   const verticesInfo = document.getElementById("vertices_info");
   const polygonsInfo = document.getElementById("polygons_info");
   const widthInfo = document.getElementById("width_info");
   const heightInfo = document.getElementById("height_info");
   const depthInfo = document.getElementById("depth_info");

   verticesInfo.innerHTML = `Vertices: ${cpuModel.vertices.length}`;
   polygonsInfo.innerHTML = `Polygons: ${cpuModel.polygons.length}`;
   widthInfo.innerHTML = `Width: ${Math.round(gpuModel.modelWidth)}`;
   heightInfo.innerHTML = `Height: ${Math.round(gpuModel.modelHeight)}`;
   depthInfo.innerHTML = `Depth: ${Math.round(gpuModel.modelDepth)}`;
   scaleInfo.value = scalator.scaleFactor.toFixed(1);
};
  
// Creates a main renderer and assigns it to the main renderer variable.
export const setMainRenderer = (globalVars) => {
   const gpuModel = globalVars.gpuModel;
   let mainRenderer = globalVars.mainRenderer;

   if (!gpuModel)
      return;

   const main = document.getElementsByName("main_renderer");
   const rendererMap = {
      "Face": DirectFaceRenderer,
      "Vertex": DirectVertexRenderer,
      "Flat": FlatRenderer,
   };
   const checkedElement = main.find(element => element.checked);
   const RendererClass = rendererMap[checkedElement.value];
   if (RendererClass) {
      mainRenderer = new RendererClass(gpuModel);
      mainRenderer.init();
   }
}

// Creates a list of  every secondary renderer selected created and 
// adds it to the secondary renderers variable.
export const setSecondaryRenderers = (globalVars) => {
   const gpuModel = globalVars.gpuModel;

   if (!gpuModel)
      return;

   const secondaryRenderers = [];
   const secondary = document.getElementsByName("secondary_renderer");
   const rendererMap = {
      "WireFrame": WireRenderer,
      "VertexNormals": VNormalsRenderer,
      "FaceNormals": FNormalsRenderer,
      "VertexCloud": VCloudRenderer
   };
   secondary.filter(element => element.checked).map(checkedElement => {
      const RendererClass = rendererMap[checkedElement.value];
      if (RendererClass) {
         const secondaryRenderer = new RendererClass(gpuModel);
         secondaryRenderer.init();
         secondaryRenderers.push(secondaryRenderer);
      }
   });

   if (secondaryRenderers.length)
      globalVars.secondaryRenderers = secondaryRenderers
}

// Changes the viewtype between perspective and orthogonal.
export const changeViewType = (globalVars) => {
   const gpuModel = globalVars.gpuModel;

   if (!gpuModel)
      return;
    
   const viewType = document.getElementsByName("view_type");
   if (viewType[0].checked)
      gpuModel.setViewType("perspective");
   else
      gpuModel.setViewType("ortho");
}
  
// Resets the model to its original position.
export const resetView = (globalVars, draw) => {
   const gpuModel = globalVars.gpuModel;
   const rotator = globalVars.rotator;
   const translator = globalVars.translator;
   const scalator = globalVars.scalator;
   const scaleInfo = globalVars.scaleInfo;
    
   if (rotator == undefined || translator == undefined)
      return;

   rotator.reset();
   translator.reset();
   scalator.reset();
   scaleInfo.value = scalator.getScaleFactor().toFixed(1);
   gpuModel.reset();
   draw();
}

// Rescales the model when the canvas changes size.
export const rescaleView = (globalVars, draw) => {
   const gpuModel = globalVars.gpuModel;
   const rotator = globalVars.rotator;
   const translator = globalVars.translator;
   const scalator = globalVars.scalator;

   if (rotator == undefined || translator == undefined)
      return;
  
   rotator.rescale();
   translator.rescale();
   scalator.rescale();
   gpuModel.rescale();
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
export const enableModelDependant = () => {
   switchClassDependant('model-d', 'enable');
}
  
  // Enables every disabled button with the evaluation dependant class
export const enableEvaluationDependant = () => {
   switchClassDependant('eval-d', 'enable');
}
  
export const disableEvaluationDependant = () => {
   switchClassDependant('eval-d', 'disable');
}