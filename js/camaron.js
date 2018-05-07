"use strict";

var model;
var rModel;
var mainRenderer;
var secondaryRenderers = [];

var trackBall;
var dragging = false;

var file = document.getElementById('model_file');
var canvas = document.getElementById("glCanvas");
var gl = canvas.getContext("webgl2");
if (!gl) {alert("No WebGL");}

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
       trackBall = new virtualTrackBall();
       trackBall.setWinSize(gl.canvas.clientWidth, gl.canvas.clientHeight);
       updateInfo();
       draw();
       initEventHandlers();
      }
    }
    reader.readAsBinaryString(file.files[0]);
  }
}

function updateInfo(){
  var verticesSpan = document.getElementById("vertices_span");
  var polygonsSpan = document.getElementById("polygons_span");
  verticesSpan.innerHTML = model.getVerticesCount();
  polygonsSpan.innerHTML = model.getPolygonsCount();
}

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

function changeViewType(){
  if(rModel == undefined){
    return;
  }
  var viewType = document.getElementsByName("view_type");

  for(var i = 0; i < viewType.length; i++){
    if(viewType[i].checked){
      var name = viewType[i].value;
      rModel.setViewType(name);
    }
  }  
}

function resetView(){
  if(trackBall == undefined)
    return;

  trackBall.reset();
  rModel.reset();
  draw();
}

function draw(){
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.CULL_FACE);
  if(mainRenderer != null){
    mainRenderer.draw();
  }

  for(var i = 0; i < secondaryRenderers.length; i++){
    secondaryRenderers[i].draw();
  }
}

function degToRad(d) {
  return d * Math.PI / 180;
}

function initEventHandlers(){
  canvas.onmousedown = function(e){
    dragging = true;
    var rect = canvas.getBoundingClientRect();
    trackBall.setRotationStart(event.clientX - rect.left, event.clientY - rect.top);
  }

  canvas.onmouseup = function(e){
    dragging = false;
  }

  canvas.onmousemove = function(e){
    if(dragging){
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      trackBall.rotateTo(x, y);

      rModel.setRotation(trackBall.getRotationMatrix());
      draw();
    }
  }

  canvas.onwheel = function(e){
    e.preventDefault();
    if(e.deltaY < 0){
      rModel.setScale(0.1);
    }else{
      rModel.setScale(-0.1);
    }
    draw();
  }
}