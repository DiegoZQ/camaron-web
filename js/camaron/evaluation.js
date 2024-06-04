"use strict";

// requires "../evaluation/AngleEvaluationStrategy";
// requires "../evaluation/AreaEvaluationStrategy";
// requires "./view-helpers";


/*--------------------------------------------------------------------------------------
------------------------------------- EVALUATIONS --------------------------------------
----------------------------------------------------------------------------------------

These functions are for controlling when a evaluation is applied.
These should be eventually refactored for readability purposes. 
--------------------------------------------------------------------------------------*/

const showEvaluationResults = () => {
   mainView.classList.remove("view0");
   mainView.classList.add("view2");

   rescaleView();
   document.getElementById('info').innerHTML = '';

   const binSize = evaluationResults['max'] / 20;
   // heatmap base
   //const selectedColor = colorConfig.selectedColor;
   //const inverseColor = selectedColor.map(v => 1-v);
   //const diff = vec4.create();
   //vec4.subtract(diff, selectedColor, inverseColor);
   //const heatmapColors = generateRange(0, 1, 0.1).map(number => {
   //   const scaleVector = vec4.create();
   //   vec4.scale(scaleVector, diff, number);
   //   const addVector = vec4.create();
   //   vec4.add(addVector, inverseColor, scaleVector);
   //   return [JSON.stringify(number), parseVectorToRGB(addVector)];
   //})
   //const nbins = Math.ceil((evaluationResults['max'] - evaluationResults['min']) / binSize) + 1;
   //const color = generateRange(1, nbins, 1).map(v => Math.round(v));

   const data = [{
      x: evaluationResults['list'],
      //autobinx: false,
      //cauto: false,
      //histfunc: "count",
      type:'histogram',
      marker: {
         //cmin: 1,
         //cmax: nbins,
         //color: color,
         //colorscale: heatmapColors,
         color: "rgba(140, 155,244, 1)"
      },
      xbins:{start: 0, end: evaluationResults['max'] + 1, size: binSize}
   }];
   const layout = {bargap: 0.05, title: evaluationResults['title'], xaxis: {title: evaluationResults['x_axis']}};
   Plotly.newPlot('info', data, layout);
}

const evalButtonHandler = (e) => {
   if (e.target.classList.contains('disabled')) {
      return;
   }
   const evaluationMethod = document.querySelector("#evaluation-type .button").getAttribute('value');

   const evaluationModeOptions = Array.from(document.getElementsByName("ev-option"));
   const checkedMode = evaluationModeOptions.find(element => element.checked);
   if (!checkedMode)
      return;
   const evaluationMode = checkedMode.value;
   let evaluation = null;

   if (evaluationMethod === 'angle' || evaluationMethod === 'angle2') {
      evaluation = new AngleEvaluationStrategy(model, evaluationMode);
   } else if (evaluationMethod === 'area') {
      evaluation = new AreaEvaluationStrategy(model, evaluationMode);
   } else if (evaluationMethod === 'edges') {
      evaluation = new EdgesEvaluationStrategy(model, evaluationMode);
   } else if (evaluationMethod === 'volume') {
      evaluation = new VolumeEvaluationStrategy(model, evaluationMode);
   } else if (evaluationMethod === 'aspect-ratio') {
      evaluation = new AspectRatioEvaluationStrategy(model, evaluationMode);
   } else {
      alert("not implemented... yet");
      return;
   }

   evaluationResults = evaluation.evaluate();
   showEvaluationResults();
   enableEvaluationDependant();
}