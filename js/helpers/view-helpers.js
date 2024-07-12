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
   const polytopesInfo = document.getElementById("polytopes_info");
   const widthInfo = document.getElementById("width_info");
   const heightInfo = document.getElementById("height_info");
   const depthInfo = document.getElementById("depth_info");

   verticesInfo.innerHTML = `Vertices: ${model.vertices.length}`;
   polytopesInfo.innerHTML = '• ';
   if (model.modelType === 'PSLG') {
      polytopesInfo.innerHTML += `Edges: ${model.edges?.length}`;
   } else if (model.modelType === 'PolygonMesh') {
      polytopesInfo.innerHTML += `Polygons: ${model.polygons?.length}`;
   } else if (model.modelType === 'PolyhedronMesh') {
      polytopesInfo.innerHTML += `Polyhedrons: ${model.polyhedrons?.length}`;
   }
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

const setHeaderStartConfiguration = () => {
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

const setSelectionAndEvaluationOptions = () => {
   // Vacía las opciones previas
   $('.drop-down').find('.select-list').empty();
   // También la opción guardada en el div de clase button, además de deshabilitarlo momentáneamente.
   $('.drop-down .button').empty();
   $('.drop-down .button').off('click');
   // Y deshabilita el select box correspondiente a alguna opción previa.
   $('.select-box').removeClass('active').hide();
   if (!model || (model && !['PolygonMesh', 'PolyhedronMesh'].includes(model.modelType))) {
      $('.drop-down .button').addClass('disabled');
      $('.drop-down .button').html('<div><i class="material-icons" style="color: #7B7BDD;">block</i><span>Not available</span></div>');
      $(`.select-box.none-box`).fadeIn().addClass('active');
      $('#apply_btn').addClass('disabled');
      $('#eval_btn').addClass('disabled');
      return;
   }
   $('.drop-down .button').removeClass('disabled');
   $('#apply_btn').removeClass('disabled');
   $('#eval_btn').removeClass('disabled');
   let options;
   if (model.modelType === 'PolygonMesh') {
      options = [
         {value: 'angle', dataImg: 'img/icon-ev-angles.svg', text: 'By Polygon Internal Angles', evaluation: true},
         {value: 'area', dataImg: 'img/icon-ev-area.svg', text: 'By Polygons Area', evaluation: true},
         {value: 'edges', dataImg: 'img/icon-ev-edges.svg', text: 'By Polygons Edges Number', evaluation: true},
         {value: 'aspect-ratio', dataImg: 'img/icon-ev-aspect-ratio.svg', text: 'By Polygons Aspect Ratio', evaluation: true},
         {value: 'id', dataImg: 'img/img-id.svg', text: 'By Polygon ID', evaluation: false}
      ]
   } else if (model.modelType === 'PolyhedronMesh') {
      options = [
         {value: 'angle2', dataImg: 'img/icon-ev-dihedral.svg', text: 'By Polyhedron Solid Angles', evaluation: true},
         {value: 'area', dataImg: 'img/icon-ev-surface.svg', text: 'By Polyhedron Surface', evaluation: true},
         {value: 'volume', dataImg: 'img/icon-ev-volume.svg', text: 'By Polyhedron Volume', evaluation: true},
         {value: 'id', dataImg: 'img/img-id.svg', text: 'By Polyhedron ID', evaluation: false},
      ]
   }
   options.forEach(option => {
      // Crea un elemento li que representa una opción
      const li = $('<li class="clsAnchor" value="' + option.value + '"><img src="' + option.dataImg + '"/>' + '<span>' + option.text + '</span></li>');
      // Por cada opción, al hacer click
      li.on('click', function() {       
         // Modifica el objeto .button más cercano con información de la opción seleccionada   
         $('.drop-down').has(this).find('.button').html('<div><img src="' + option.dataImg + '"/>' + '<span>' + option.text + '</span></div>' + '<a href="javascript:void(0);" class="select-list-link"><i class="material-icons">keyboard_arrow_down</i></a>'); 
         $('.drop-down').has(this).find('.button').attr('value', option.value);   
         // Oculta el selector de opciones
         $('.drop-down').has(this).find('.select-list').removeClass('active');  
         // Y si su padre tiene id selection_type, oculta los elementos de clase select-box y muestra el relevante a la opción escogida  
         $('#selection-type').has(this).siblings('.select-box').removeClass('active').hide();
         $('#selection-type').has(this).siblings(`.select-box.${option.value}-box`).fadeIn().addClass('active');
      });
      // Finalmente, agrega las opciones disponibles dadas por el tipo de malla a los drop-downs de selection y evaluation (si evaluation=true).
      const dropDownSelector = option.evaluation ? '.drop-down' : '#selection-type';
      $(dropDownSelector).find('.select-list').append(li);
   })
   // Agrega la primera opción por defecto en los elementos de clase button y los habilita para poder seleccionar las opciones disponibles.
   $('.drop-down .button').html('<div><img src="' + options[0].dataImg + '"/>' + '<span>' + options[0].text + '</span></div>' + '<a href="javascript:void(0);" class="select-list-link"><i class="material-icons">keyboard_arrow_down</i></a>');
   $('.drop-down .button').attr('value', options[0].value);     
   $('.drop-down .button').on('click', function(){      
   $('.drop-down').has(this).find('.select-list').toggleClass('active');  
   });
   // Y finalmente muestra el select box relevante a la primera opción.
   $(`.select-box.${options[0].value}-box`).fadeIn().addClass('active');
}