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
  if (mainRenderer)
    mainRenderer.draw();
  for (const secondaryRenderer of secondaryRenderers)
    secondaryRenderer.draw();
}

/*--------------------------------------------------------------------------------------
--------------------------------- BUTTONS INTERACTIONS ---------------------------------
--------------------------------------------------------------------------------------*/

// Upload model button
const realFileButton = document.getElementById('import_e');
const fancyFileButton = document.getElementById('import_b');

// The onchange event is triggered on the input when a file is selected.
realFileButton.onchange = uploadFileHandler(realFileButton);
// Binds the design button, with the actual input type file button.
fancyFileButton.onclick = () => realFileButton.click();


// view button
const realViewButton = document.getElementById('view_e');
const fancyViewButton = document.getElementById('view_b');
fancyViewButton.onclick = () => realViewButton.click();

// reset button
const resetViewButton = document.getElementById("reset_view");
resetViewButton.onclick = () => {
  if (!this.classList.contains("disabled")) 
    resetView();
};

// main renderer buttons
const realFaceButton = document.getElementById('face_e'); 
const fancyFaceButton = document.getElementById('face_b'); 
const realVertexButton = document.getElementById('vertex_e');
const fancyVertexButton = document.getElementById('vertex_b');
const realFlatButton = document.getElementById('flat_e');
const fancyFlatButton = document.getElementById('flat_b');
const realNoneButton = document.getElementById('none_e');
const fancyNoneButton = document.getElementById('none_b');
const fancyMainRenderersButtons = [fancyFaceButton, fancyVertexButton, fancyFlatButton, fancyNoneButton]

function setupMainRendererButton(realButton, fancyButton) {
  fancyButton.onclick = () => {
    realButton.click();
    fancyMainRenderersButtons.forEach(button => {
      if (button != fancyButton)
        button.classList.remove("active")
      else 
        button.classList.add("active")
    })
  };
}

setupMainRendererButton(realFaceButton, fancyFaceButton);
setupMainRendererButton(realVertexButton, fancyVertexButton);
setupMainRendererButton(realFlatButton, fancyFlatButton);
setupMainRendererButton(realNoneButton, fancyNoneButton);

// selection button
const applyButton = document.getElementById("apply_btn");
applyButton.onclick = applyButtonHandler;

// evaluation button
const evalButton = document.getElementById("eval_btn");
evalButton.onclick = evalButtonHandler;