"use strict";

// requires from "./view-helpers";
// requires "./model-uploader";
// requires "./selection";
// requires "./evaluation";


/*--------------------------------------------------------------------------------------
----------------------------------- GLOBAL VARIABLES -----------------------------------
--------------------------------------------------------------------------------------*/

let cpuModel = null;
let gpuModel = null;
let loader = null;
let mainRenderer = null;
let secondaryRenderers = [];

let rotator = null;
let scalator = null;
let translator = null;
let rotating = false;
let moving = false;

let scaleInfo = document.getElementById("scale_info");
let canvas = document.getElementById("glCanvas");
let mainView = document.getElementById('main-view');

let appliedSelections = [];
let evaluationResults = {};

const gl = canvas.getContext("webgl2");
if (!gl) 
  alert("No WebGL");


/*--------------------------------------------------------------------------------------
---------------------------------- MAIN DRAW FUNCTION ----------------------------------
----------------------------------------------------------------------------------------

This is the function that is called everytime the model suffers a change. Changes include
moving the model, changing or adding a renderer or applying some selection.
--------------------------------------------------------------------------------------*/
const draw = () => {

  resizeCanvas(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  if (mainRenderer) {
    mainRenderer.draw();
  }
  for (const secondaryRenderer of secondaryRenderers) {
    secondaryRenderer.draw();
  }
}

/*--------------------------------------------------------------------------------------
--------------------------------- BUTTONS INTERACTIONS ---------------------------------
--------------------------------------------------------------------------------------*/

// Download model button
const exportFileButton = document.getElementById('export_button');
exportFileButton.onclick = downloadFileHandler;


function takeScreenshot() {
  draw();
  const dataUrl = canvas.toDataURL('image/png');
  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = 'screenshot.png';

  document.body.appendChild(downloadLink);
  downloadLink.click();

  document.body.removeChild(downloadLink);
};

// main renderer handler
function mainRendererOnClick(clickedRenderer) {
  const activeRenderer = document.querySelector('a[name="main_renderer"].active');
  if (activeRenderer != clickedRenderer && !clickedRenderer.classList.contains('disabled')) {
    activeRenderer.classList.remove('active');
    clickedRenderer.classList.add('active')
    setMainRenderer(clickedRenderer);
    draw();
  }
}
// secondary renderer handler
function secondaryRendererOnClick(clickedRenderer) {
  if (!clickedRenderer.classList.contains('disabled')) {
    if (clickedRenderer.classList.contains('active')) {
      clickedRenderer.classList.remove('active');
    } else {
      clickedRenderer.classList.add('active');
    }
    setSecondaryRenderers();
    draw();
  }
}
// view button
function togglePerspective(e) {
  const scene = e.querySelector('.scene');
  if (scene.classList.contains('perspective')) {
    scene.classList.remove('perspective');
    scene.classList.add('ortho');
    changeViewType('ortho');
  } else {
    scene.classList.remove('ortho');
    scene.classList.add('perspective');
    changeViewType('perspective');
  }
  draw();
}

// selection button
const applyButton = document.getElementById("apply_btn");
applyButton.onclick = applyButtonHandler;

// evaluation button
const evalButton = document.getElementById("eval_btn");
evalButton.onclick = evalButtonHandler;