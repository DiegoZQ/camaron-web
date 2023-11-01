"use strict";


import GPUModel from "../model/GPUModel";
import PolygonMesh from "../model/PolygonMesh";
import OffLoadStrategy from "../fileloader/OffLoadStrategy";
import Rotator from "../ui/rotator";
import Scalator from "../ui/scalator";
import Translator from "../ui/translator";

import { updateInfo, setMainRenderer, setSecondaryRenderers, changeViewType, resetView, rescaleView, enableModelDependant, enableEvaluationDependant, disableEvaluationDependant } from "./view-helpers";

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
var evaluation_results = {}

var colorConfig = new ColorConfig();

var scaleInfo = document.getElementById("scale_info");

var mainView = document.getElementById('main-view');
var canvas = document.getElementById("glCanvas");

var gl = canvas.getContext("webgl2");
if (!gl) {alert("No WebGL");}



const globalVars = {
  cpuModel: null,
  gpuModel: null,
  mainRenderer: null,
  secondaryRenderers: [],

  scalator: null,
  translator: null,
  rotator: null,
  rotating: false,
  moving: false,

  scaleInfo: document.getElementById("scale_info"),

  canvas: document.getElementById("glCanvas")
};



/*--------------------------------------------------------------------------------------
--------------------------------- OPEN FILE/DRAW MODEL ---------------------------------
--------------------------------------------------------------------------------------*/

let cpuModel = null; 
let gpuModel = null;
let rotator = null;
let translator = null;
let scalator = null; 

const file = document.getElementById('import_e');
const fileButton = document.getElementById('import_b');
const modalLoading = $('#modal-loading');

// Opens the loading modal.
const openLoadingModal = () => {
   modalLoading.fadeIn().addClass('active');
   modalLoading.find('.modal-container').removeClass('bottom-out').addClass('bottom-in');
};

// Closes the loading modal.
const closeLoadingModal = () => {
   modalLoading.delay(150).fadeOut().removeClass('active').find('.modal-container').toggleClass('bottom-in bottom-out');
};

// Selects loading strategy
const selectLoadingStrategy = (extension, fileArray) => {
   if (extension === 'off') 
      return new OffLoadStrategy(fileArray);
   alert('Unsupported Format');
   // TODO: Implement a null loader
   return null;   
};

// Waits for the gpuModel to be loaded
const waitForGPUModelLoaded = (gpuModel) => {
   if (gpuModel != null && gpuModel.loaded === 7) {
      setMainRenderer(globalVars);
      setSecondaryRenderers(globalVars);
      updateInfo(globalVars);
      draw();
      enableModelDependant();
      updateEventHandlers();
      closeLoadingModal();
   } else {
      setTimeout(waitLoaded, 500);
   } 
};

// Initializes gpuModel loading and waits for it to be loaded
const loadGPUModel = (gpuModel) => {
   setTimeout(() => {
      gpuModel.loadTriangles();
      gpuModel.loadTrianglesNormals();
      gpuModel.loadVertexNormals();
      gpuModel.loadEdges();
      gpuModel.loadVertices();
      gpuModel.loadVertexNormalsLines();
      gpuModel.loadFaceNormalsLines();
   }, 0);
   changeViewType(globalVars);
   rotator = new Rotator();
   translator = new Translator();
   scalator = new Scalator();
   
   waitForGPUModelLoaded(gpuModel);
};

// Binds the design button, with the actual input type file button.
fileButton.onclick = () => {
   file.click();
};

// The onchange event is triggered on the input when a file is selected.
// Here is were everything gets initialized.
file.onchange = () => {
   if (file.files.length) {
      openLoadingModal();

      const handleFileLoad = (e) => {
         setTimeout(() => {
            mainView.classList.remove('view2');
            mainView.classList.add('view0');
            disableEvaluationDependant();
            appliedSelections = [];
            updateActiveSelections();

            const fileArray = e.target.result.split('\n');
            const extension = file.files[0].name.split('.')[1];
            const loader = selectLoadingStrategy(extension, fileArray);

            if (loader) {
               cpuModel = loader.load();
               if (cpuModel.isValid) {
                  gpuModel = new GPUModel(cpuModel);
                  loadGPUModel(gpuModel);
               } else {
                  alert('Invalid format');
               } 
            }
         }, 400); // delay de 400ms después de abrir el archivo
      };
      const reader = new FileReader();
      reader.onloadend = handleFileLoad;
      reader.readAsBinaryString(file.files[0]);
   }
};

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


// Button binding  of reset button, because i dont know where else to put it.
document.getElementById("reset_view").onclick = function() {
  if(this.classList.contains("disabled")){
    return;
  }
  resetView(globalVars, draw);
};


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
      list = document.getElementById("id_list").value.split(',');
    }

    console.log(list)

    selection = new IdSelectionStrategy(model, selectionMode, idFrom, idTo, list);

  }else if(selectionMethod == 'angle'){
    var angleFrom = document.getElementById("angle_from").value;
    var angleTo = document.getElementById("angle_to").value;
    selection = new AngleSelectionStrategy(model, selectionMode, angleFrom, angleTo);

  }else if(selectionMethod == 'area'){
    var areaFrom = document.getElementById("area_from").value;
    var areaTo = document.getElementById("area_to").value;
    selection = new AreaSelectionStrategy(model, selectionMode, areaFrom, areaTo);

  }else if(selectionMethod == 'edges'){
    var edges_number = document.getElementById("edges_number").value;
    selection = new EdgesSelectionStrategy(model, selectionMode, edges_number)
  }

  if(selection.mode == 'clean'){
      applied_selections = [selection];
  }else{
    applied_selections.push(selection);
  }

  apply_selections();
}

/*--------------------------------------------------------------------------------------
------------------------------------- EVALUATIONS --------------------------------------
----------------------------------------------------------------------------------------

These functions are for controlling when a evaluation is applied.
These should be eventually refactored for readability purposes. 
--------------------------------------------------------------------------------------*/

var evalButton = document.getElementById("eval_btn");

function show_evaluation_results(){
  mainView.classList.remove("view0");
  mainView.classList.add("view2");
  rescaleView(globalVars, draw);
  document.getElementById('info').innerHTML = '';
  var trace = {
    x: evaluation_results['list'],
    type:'histogram',
    marker: {
      color: "rgba(140, 155,244, 1)"
    },
    xbins:{start:0, end: evaluation_results['max']+1, size:evaluation_results['max']/20}
  };
  var data = [trace];
  var layout = {
    bargap:0.05,
    title: evaluation_results['title'],
    xaxis: {title: evaluation_results['x_axis']}, 
  }
  Plotly.newPlot('info', data, layout);
}

evalButton.onclick = function(){
  var evaluation;
  var evaluationMode;
  var evaluationMethod = document.getElementById("evaluation-method").value;
  var evaluationModeOptions = document.getElementsByName("ev-option")

  for(var i = 0; i < evaluationModeOptions.length; i++){
    if(evaluationModeOptions[i].checked){
      evaluationMode = evaluationModeOptions[i].value;
      break;
    }
  }

  if(evaluationMethod == 'angle'){
    evaluation = new AngleEvaluationStrategy(model, evaluationMode);
  }else if(evaluationMethod == 'area'){
    evaluation = new AreaEvaluationStrategy(model, evaluationMode);
  }else{
    alert("not implemented... yet");
    return;
  }

  evaluation_results = evaluation.evaluate();
  show_evaluation_results();
  enableEvaluationDependant();
}

/*--------------------------------------------------------------------------------------
---------------------------------- MAIN DRAW FUNCTION ----------------------------------
----------------------------------------------------------------------------------------

This is the function that is called everytime the model suffers a change. Changes include
moving the model, changing or adding a renderer or applying some selection.
--------------------------------------------------------------------------------------*/

function draw(){
  resizeCanvas(gl.canvas);
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

function resizeCanvas(canvas) {
  var width  = canvas.clientWidth*2;
  var height = canvas.clientHeight*2;
  if(width > height){
    canvas.width  = width;
    canvas.height = width/2;
  }else{
    canvas.width  = height*2;
    canvas.height = height;
  }
}