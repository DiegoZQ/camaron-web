"use strict";

/*--------------------------------------------------------------------------------------
----------------------------------- COMMON VARIABLES -----------------------------------
--------------------------------------------------------------------------------------*/

var model;
var rModel;
var mainRenderer;
var secondaryRenderers = [];

var rotator;
var translator;
var scalator;
var dragging = false;
var rotating = false;
var moving = false;

var applied_selections = [];

var colorConfig = new ColorConfig();

var scaleInfo = document.getElementById("scale_info");

var canvas = document.getElementById("glCanvas");

var gl = canvas.getContext("webgl2");
if (!gl) {alert("No WebGL");}

/*--------------------------------------------------------------------------------------
--------------------------------- OPEN FILE/DRAW MODEL ---------------------------------
--------------------------------------------------------------------------------------*/

var file = document.getElementById('import_e');
var file_button = document.getElementById('import_b');

// The next variable and the following functions are the only piece of JQuery in here
// (besides the entire sitio.js file). This was done by the designer and will be replaced
// as soon as I have time with pure JavaScript.

var modal_loading = $('#modal-loading');

// Opens the loading modal.

function open_loading_modal(){
  modal_loading.fadeIn().addClass('active');
  modal_loading.find('.modal-container').removeClass('bottom-out').addClass('bottom-in');
}

// Closes the loading modal.

function close_loading_modal(){
  modal_loading.delay(150).fadeOut().removeClass('active');$('.modal-container').toggleClass('bottom-in bottom-out');
}

// Binds the design button, with the actual input type file button.

file_button.onclick = function(){
  file.click();
}

// The onchange event is triggered on the input when a file is selected.
// Here is were everything gets initialized.

file.onchange = function(){
  if(file.files.length){
    var reader = new FileReader();
    reader.onload = function(e){
      open_loading_modal();
      // waiting half second for the modal to open
      setTimeout(function(){
        var fileArray = e.target.result.split('\n');
        var loader = new OffLoadStrategy(fileArray);
        if(loader.isValid()){
          model = loader.load();
          rModel = new RModel(model);
          rModel.loadData();
          changeViewType();
          setMainRenderer();
          setSecondaryRenderers();
          rotator = new Rotator();
          translator = new Translator();
          scalator = new Scalator();
          scaleInfo.value = scalator.getScaleFactor().toFixed(1);
          updateInfo();
          draw();
          enable_model_dependant();
          updateEventHandlers();
          close_loading_modal();
        } 
      }, 400);
    }
    reader.readAsBinaryString(file.files[0]);
  }  
}

/*--------------------------------------------------------------------------------------
--------------------------------- BUTTONS INTERACTIONS ---------------------------------
--------------------------------------------------------------------------------------*/

// view button
var view = document.getElementById('view_e');
var view_button = document.getElementById('view_b');

view_button.onclick = function(){
  view.click();
}

// main renderers buttons

var face = document.getElementById('face_e');
var face_button = document.getElementById('face_b');
var vertex = document.getElementById('vertex_e');
var vertex_button = document.getElementById('vertex_b');
var flat = document.getElementById('flat_e');
var flat_button = document.getElementById('flat_b');
var none = document.getElementById('none_e');
var none_button = document.getElementById('none_b');

face_button.onclick = function(){
  face.click();
  face_button.classList.add("active");
  vertex_button.classList.remove("active");
  flat_button.classList.remove("active");
  none_button.classList.remove("active");
}

vertex_button.onclick = function(){
  vertex.click();
  face_button.classList.remove("active");
  vertex_button.classList.add("active");
  flat_button.classList.remove("active");
  none_button.classList.remove("active");
}

flat_button.onclick = function(){
  flat.click();
  face_button.classList.remove("active");
  vertex_button.classList.remove("active");
  flat_button.classList.add("active");
  none_button.classList.remove("active");
}

none_button.onclick = function(){
  none.click();
  face_button.classList.remove("active");
  vertex_button.classList.remove("active");
  flat_button.classList.remove("active");
  none_button.classList.add("active");
}


/*--------------------------------------------------------------------------------------
------------------------------------- VIEW HELPERS -------------------------------------
----------------------------------------------------------------------------------------

These functions are used for setting and updating different aspects of the view or the model.
These are often used by buttons on the same view, or by other methods.
--------------------------------------------------------------------------------------*/

// Updates the visible information of the model when is loaded.

function updateInfo(){
  var verticesInfo = document.getElementById("vertices_info");
  var polygonsInfo = document.getElementById("polygons_info");
  verticesInfo.innerHTML ="Vertices: " + model.getVerticesCount();
  polygonsInfo.innerHTML = "Polygons: " + model.getPolygonsCount();

  var widthInfo = document.getElementById("width_info");
  var heightInfo = document.getElementById("height_info");
  var depthInfo = document.getElementById("depth_info");

  widthInfo.innerHTML ="Width: " + Math.round(rModel.modelWidth);
  heightInfo.innerHTML = "Height: " + Math.round(rModel.modelHeight);
  depthInfo.innerHTML = "Depth: " + Math.round(rModel.modelDepth);

}

// Creates a main renderer and assigns it to the main renderer variable.

function setMainRenderer(){
  if(rModel == undefined){
    return;
  }
  var main = document.getElementsByName("main_renderer");
  for(var i = 0; i < main.length; i++){
    if(main[i].checked){
      var name = main[i].value;
      if(name == "Face"){
        mainRenderer = new DirectFaceRenderer(rModel);
      }else if(name == "Vertex"){
        mainRenderer = new DirectVertexRenderer(rModel);
      }else if(name == "Flat"){
        mainRenderer = new FlatRenderer(rModel);
      }else{
        mainRenderer = null;
      }

      if(mainRenderer != null){
        mainRenderer.init();
      }
      break;
    }
  }
}

// Creates a list of  every secondary renderer selected created and 
// adds it to the secondary renderers variable.

function setSecondaryRenderers(){
  if(rModel == undefined){
    return;
  }
  var secondary = document.getElementsByName("secondary_renderer");
  secondaryRenderers = [];
  for(var i = 0; i < secondary.length; i++){
    if(secondary[i].checked){
      var name = secondary[i].value;
      if(name == "WireFrame"){
        var secondaryRenderer = new WireRenderer(rModel);
        secondaryRenderer.init();
        secondaryRenderers.push(secondaryRenderer);
      }
    }
  } 
}

// Changes the viewtype between perspective and orthogonal.

function changeViewType(){
  if(rModel == undefined){
    return;
  }
  var viewType = document.getElementsByName("view_type");
  if(viewType[0].checked){
    rModel.setViewType("perspective");
  }else{
    rModel.setViewType("ortho");
  }
}

// Resets the model to its original position.

function resetView(){
  if(rotator == undefined || translator == undefined)
    return;

  rotator.reset();
  translator.reset();
  scalator.reset();
  scaleInfo.value = scalator.getScaleFactor().toFixed(1);
  rModel.reset();
  draw();
}

// Rescales the model when the canvas changes size.

function rescaleView(){
  if(rotator == undefined || translator == undefined)
    return;

  rotator.rescale();
  translator.rescale();
  scalator.rescale();
  rModel.rescale();
  draw();
}

// Button binding  of reset button, because i dont know where else to put it.

document.getElementById("reset_view").onclick =function() {
  if(this.classList.contains("disabled")){
    return;
  }
  resetView()
};


// Enables every disabled button with the model dependant class

function enable_model_dependant(){
  var elements = document.getElementsByClassName("model-d");
  for(var i = 0; i < elements.length; i++){
    elements[i].classList.remove("disabled");
  }
}

// Enables every disabled button with the evaluation dependant class

function enable_evaluation_dependant(){
  var elements = document.getElementsByClassName("eval-d");
  for(var i = 0; i < elements.length; i++){
    elements[i].classList.remove("disabled");
  
  }
}

/*--------------------------------------------------------------------------------------
---------------------------------- MOUSE INTERACTIONS ----------------------------------
----------------------------------------------------------------------------------------

These functions are used for mouse operations such as moving, rotating and scalating.
The binding of the functions with the canvas is included here.
--------------------------------------------------------------------------------------*/

function mousedown(e){
  if(e.button == 0){
    rotating = true;
    var rect = canvas.getBoundingClientRect();
    rotator.setRotationStart(event.clientX - rect.left, event.clientY - rect.top);
  }else if(e.button == 2){
    moving = true;
    var rect = canvas.getBoundingClientRect();
    translator.setMovementStart(event.clientX - rect.left, event.clientY - rect.top)
  }
}

function mouseup(e){
  rotating = false;
  moving = false;
}

function mousemove(e){
  if(rotating){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    rotator.rotateTo(x, y);

    rModel.setRotation(rotator.getRotationMatrix());
    draw();
  }

  if(moving){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    translator.moveTo(x, y);

    rModel.setTranslation(translator.getMovementVector());
    draw();
  }
}

function onwheel(e){
  e.preventDefault();
  if(e.deltaY < 0){
    scalator.scale(0.1)
  }else{
    scalator.scale(-0.1);
  }
  rModel.setScale(scalator.getScaleFactor());

  scaleInfo.value = scalator.getScaleFactor().toFixed(1);

  draw();
}

function updateEventHandlers(){
  canvas.addEventListener("mousedown", mousedown);
  canvas.addEventListener("mouseup", mouseup);
  canvas.addEventListener("mousemove", mousemove);
  canvas.addEventListener("wheel", onwheel);
  canvas.addEventListener("contextmenu", function(e){e.preventDefault();})
}

/*--------------------------------------------------------------------------------------
-------------------------------------- SELECTIONS --------------------------------------
----------------------------------------------------------------------------------------

These functions are for controlling when a selection is applied.
These should be eventually refactored for readability purposes. 
--------------------------------------------------------------------------------------*/

var applyButton = document.getElementById("apply_btn");

function apply_selections(){
  for(var i = 0; i < applied_selections.length; i++){
    applied_selections[i].apply();
  }
  mainRenderer.updateColor();
  draw();
  update_active_selections();
}


function remove_selection(button){
  var index = button.getAttribute("data-index");
  var selection = applied_selections[index];

  if(selection.getMode() == "clean"){
    selection.clean();
    applied_selections = [];
  }else{
    applied_selections.splice(index, 1);
  }
  apply_selections();
}


function update_active_selections(){
  var selections_container = document.getElementById("selections-container");

  while (selections_container.firstChild) {
    selections_container.removeChild(selections_container.firstChild);
  }

  for(var i =0; i < applied_selections.length; i++){
    var selection = applied_selections[i];

    var selection_tab = document.createElement("li");
    var img = document.createElement("img");
    var div = document.createElement("div");
    var span = document.createElement("span");
    var text = document.createTextNode(selection.getText());
    var remove = document.createElement("i");

    if(selection.getMode() == "clean"){
      img.setAttribute("src", "img/btn-normal.svg");
    }else if(selection.getMode() == "intersect"){
      img.setAttribute("src", "img/btn-intercept.svg");
    }else if(selection.getMode() == "add"){
      img.setAttribute("src", "img/btn-add.svg");
    }else if(selection.getMode() == "substract"){
      img.setAttribute("src", "img/btn-substract.svg");
    }

    div.setAttribute("class", "grow");
    span.appendChild(text);
    div.appendChild(span);

    remove.setAttribute("class", "material-icons");
    remove.appendChild(document.createTextNode("close"));
    remove.setAttribute("data-index", i);
    remove.setAttribute("onclick", "remove_selection(this)");

    selection_tab.appendChild(img);
    selection_tab.appendChild(div);
    selection_tab.appendChild(remove);

    selections_container.appendChild(selection_tab);
  }
}

applyButton.onclick = function(){
  var selection;
  var selectionMode;
  var specificMethod;
  var selectionMethod = document.getElementById("selection-method").value;
  var selectionModeOptions = document.getElementsByName("mode-opt")

  for(var i = 0; i < selectionModeOptions.length; i++){
    if(selectionModeOptions[i].checked){
      selectionMode = selectionModeOptions[i].value;
      break;
    }
  }

  if(selectionMethod == 'id'){
    var idFrom;
    var idTo;
    var list;
    var specificMethodOptions = document.getElementsByName("id-opt")
    for(var i = 0; i < specificMethodOptions.length; i++){
      if(specificMethodOptions[i].checked){
        specificMethod = specificMethodOptions[i].value;
        break;
      }
    }

    if(specificMethod == 'range'){
      idFrom = document.getElementById("id_from").value;
      idTo = document.getElementById("id_to").value;
      list = null;
    }else{
      idFrom = null;
      idTo = null;
      list = null;
    }

    selection = new IdSelectionStrategy(model, selectionMode, idFrom, idTo, list);

  }else if(selectionMethod == 'angle'){
    var angleFrom = document.getElementById("angle_from").value;
    var angleTo = document.getElementById("angle_to").value;

    selection = new AngleSelectionStrategy(model, selectionMode, angleFrom, angleTo)
  }

  if(selection.mode == 'clean'){
      applied_selections = [selection];
  }else{
    applied_selections.push(selection);
  }

  apply_selections();
}

/*--------------------------------------------------------------------------------------
---------------------------------- MAIN DRAW FUNCTION ----------------------------------
----------------------------------------------------------------------------------------

This is the function that is called everytime the model suffers a change. Changes include
moving the model, changing or adding a renderer or applying some selection.
--------------------------------------------------------------------------------------*/

function draw(){
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  if(mainRenderer != null){
    mainRenderer.draw();
  }

  for(var i = 0; i < secondaryRenderers.length; i++){
    secondaryRenderers[i].draw();
  }
}

/*--------------------------------------------------------------------------------------
---------------------------------------- HELPERS ---------------------------------------
----------------------------------------------------------------------------------------

These are helper functions that were not in any of the previous categories.
--------------------------------------------------------------------------------------*/
function degToRad(d) {
  return d * Math.PI / 180;
}

function radToDeg(d) {
  return d * 180 / Math.PI;
}
