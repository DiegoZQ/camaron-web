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
   const data = [{
      x: evaluationResults['list'],
      type:'histogram',
      marker: {color: "rgba(140, 155,244, 1)"},
      xbins:{start: 0, end: evaluationResults['max'] + 1, size: evaluationResults['max'] / 20}
   }];
   const layout = {bargap: 0.05, title: evaluationResults['title'], xaxis: {title: evaluationResults['x_axis']}};
   Plotly.newPlot('info', data, layout);
}

const evalButtonHandler = () => {

   const evaluationMethod = document.getElementById("evaluation-method").value;
   const evaluationModeOptions = Array.from(document.getElementsByName("ev-option"));
   const checkedMode = evaluationModeOptions.find(element => element.checked);
   if (!checkedMode)
      return;
   const evaluationMode = checkedMode.value;
   let evaluation = null;

   if (evaluationMethod == 'angle')
      evaluation = new AngleEvaluationStrategy(model, evaluationMode);
   else if(evaluationMethod == 'area')
      evaluation = new AreaEvaluationStrategy(model, evaluationMode);
   else {
      alert("not implemented... yet");
      return;
   }

   evaluationResults = evaluation.evaluate();
   showEvaluationResults();
   enableEvaluationDependant();
}