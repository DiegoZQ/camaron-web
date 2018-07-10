"use strict";

var model;
var rModel;
var mainRenderer;
var secondaryRenderers = [];

var rotator;
var translator;
var scalator;
var dragging = false;

var applied_selections = [];

var colorConfig = new ColorConfig();

var scaleInfo = document.getElementById("scale_info");

var canvas = document.getElementById("glCanvas");
var modelView = document.getElementById("model-view");
var gl = canvas.getContext("webgl2");
if (!gl) {alert("No WebGL");}

// file buttons
var file = document.getElementById('import_e');
var file_button = document.getElementById('import_b');

file_button.onclick = function(){
  file.click();
}

// view button
var view = document.getElementById('view_e');
var view_button = document.getElementById('view_b');

view_button.onclick = function(){
  view.click();
}

// movement buttons

var move = document.getElementById('move_e');
var move_button = document.getElementById('move_b');
var rotate = document.getElementById('rotate_e');
var rotate_button = document.getElementById('rotate_b');

move_button.onclick = function(){
  move.click();
  move_button.classList.add("active");
  rotate_button.classList.remove("active");
}

rotate_button.onclick = function(){
  rotate.click();
  rotate_button.classList.add("active");
  move_button.classList.remove("active");
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

// Open File

file.onchange = function(){
  if(file.files.length){
    var reader = new FileReader();
    reader.onload = function(e){
      var fileArray = e.target.result.split('\n');
      var loader = new OffLoadStrategy(fileArray);
      if(loader.isValid()){
       model = loader.load();
       rModel = new RModel(model);
       rModel.loadData();
       changeViewType();
       setRenderers();
       rotator = new Rotator();
       translator = new Translator();
       scalator = new Scalator();
       scaleInfo.value = scalator.getScaleFactor().toFixed(1);
       updateInfo();
       draw();
       updateEventHandlers();
      }
    }
    reader.readAsBinaryString(file.files[0]);
  }
}

// Info updater

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

// Renderer setters

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

function setRenderers(){
  setMainRenderer();
  setSecondaryRenderers();   
}

// ViewType Changer

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

// Reset and Rescale

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

function rescaleView(){
  if(rotator == undefined || translator == undefined)
    return;

  rotator.rescale();
  translator.rescale();
  scalator.rescale();
  rModel.rescale();
  draw();
}

// Main draw Function

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

// Random Helpers

function degToRad(d) {
  return d * Math.PI / 180;
}

// Mouse Interactionr

function rotate_mousedown(e){
  dragging = true;
  var rect = canvas.getBoundingClientRect();
  rotator.setRotationStart(event.clientX - rect.left, event.clientY - rect.top);
}

function rotate_mouseup(e){
  dragging = false;
}

function rotate_mousemove(e){
  if(dragging){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    rotator.rotateTo(x, y);

    rModel.setRotation(rotator.getRotationMatrix());
    draw();
  }
}

function move_mousedown(e){
  dragging = true;
  var rect = canvas.getBoundingClientRect();
  translator.setMovementStart(event.clientX - rect.left, event.clientY - rect.top)
}

function move_mouseup(e){
  dragging = false;
}

function move_mousemove(e){
  if(dragging){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    translator.moveTo(x, y);

    rModel.setTranslation(translator.getMovementVector());
    draw();
  }
}

function updateEventHandlers(){
  var mode = document.getElementsByName("interaction");
  for(var i = 0; i < mode.length; i++){
    if(mode[i].checked){
      var name = mode[i].value;
      if(name == "rotate"){
        canvas.removeEventListener("mousedown", move_mousedown);
        canvas.removeEventListener("mouseup", move_mouseup);
        canvas.removeEventListener("mousemove", move_mousemove);

        canvas.addEventListener("mousedown", rotate_mousedown);
        canvas.addEventListener("mouseup", rotate_mouseup);
        canvas.addEventListener("mousemove", rotate_mousemove);
      }else{
        canvas.removeEventListener("mousedown", rotate_mousedown);
        canvas.removeEventListener("mouseup", rotate_mouseup);
        canvas.removeEventListener("mousemove", rotate_mousemove); 

        canvas.addEventListener("mousedown", move_mousedown);
        canvas.addEventListener("mouseup", move_mouseup);
        canvas.addEventListener("mousemove", move_mousemove);
      }
    }
  } 
}

canvas.onwheel = function(e){
  if(rModel == undefined){
    return;
  }
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

// SELECTIONS
function apply_selections(){
  for(var i = 0; i < applied_selections.length; i++){
    applied_selections[i].apply();
    mainRenderer.updateColor();
    draw();
  }
}

// Id Selector

var applyButton = document.getElementById("apply_btn");

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

    if(selection.mode == 'clean'){
      applied_selections = [selection];
    }else{
      applied_selections.append(selection);
    }

  }

  apply_selections();
}




