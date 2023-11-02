"use strict";

// requires "../selection/IdSelectionStrategy";
// requires "../selection/AngleSelectionStrategy";
// requires "../selection/AreaSelectionStrategy";
// requires "../selection/EdgesSelectionStrategy";


/*--------------------------------------------------------------------------------------
-------------------------------------- SELECTIONS --------------------------------------
----------------------------------------------------------------------------------------

These functions are for controlling when a selection is applied.
These should be eventually refactored for readability purposes. 
--------------------------------------------------------------------------------------*/

const applySelections = () => {
   
   for (const appliedSelection of appliedSelections)
      appliedSelection.apply();

   mainRenderer.updateColor();
   draw();
   updateActiveSelections();
}

const updateActiveSelections = () => {
   const selectionsContainer = document.getElementById("selections-container");
   selectionsContainer.innerHTML = '';

   const selectionImages = {
      "clean": "img/btn-normal.svg",
      "intersect": "img/btn-intercept.svg",
      "add": "img/btn-add.svg",
      "substract": "img/btn-substract.svg"
   };
   for (let i = 0; i < appliedSelections.length; i++) {
      const selection = appliedSelections[i];
      const selectionTab = document.createElement("li");
      const img = document.createElement("img");
      const div = document.createElement("div");
      const span = document.createElement("span");
      const text = document.createTextNode(selection.text);
      const remove = document.createElement("i");

      img.setAttribute("src", selectionImages[selection.mode]);
      div.setAttribute("class", "grow");
      span.appendChild(text);
      div.appendChild(span);
      remove.setAttribute("class", "material-icons");
      remove.appendChild(document.createTextNode("close"));
      remove.setAttribute("data-index", i);
      remove.onclick = () => removeSelection(remove);

      selectionTab.appendChild(img);
      selectionTab.appendChild(div);
      selectionTab.appendChild(remove);
        
      selectionsContainer.appendChild(selectionTab);
   }   
}

const removeSelection = (button) => {
   const index = button.getAttribute("data-index");
   const selection = appliedSelections[index];
  
   if (selection.mode == "clean") {
      selection.clean();
      appliedSelections = [];
   } else {
      appliedSelections.splice(index, 1);
   }
   applySelections();
}

const applyButtonHandler = () => {
   const selectionMethod = document.getElementById("selection-method").value;
   const selectionModeOptions = Array.from(document.getElementsByName("mode-opt"));
   const checkedMode = selectionModeOptions.find(element => element.checked);
   if (!checkedMode) 
      return 
   const selectionMode = checkedMode.value;
   let selection = null;

   if (selectionMethod == 'id') {
      const specificMethodOptions = Array.from(document.getElementsByName("id-opt"));
      const checkedMethod = specificMethodOptions.find(element => element.checked);
      if (!checkedMethod)
         return  
      const specificMethod = checkedMethod.value;
      let idFrom = null;
      let idTo = null;
      let list = null;
    
      if(specificMethod == 'range') {
         idFrom = document.getElementById("id_from").value;
         idTo = document.getElementById("id_to").value;
      } else {
         list = document.getElementById("id_list").value.split(',');
      }
      console.log(list)
      selection = new IdSelectionStrategy(cpuModel, selectionMode, idFrom, idTo, list);
   } 
   else if (selectionMethod == 'angle') {
      const angleFrom = document.getElementById("angle_from").value;
      const angleTo = document.getElementById("angle_to").value;
      selection = new AngleSelectionStrategy(cpuModel, selectionMode, angleFrom, angleTo);
   }
   else if (selectionMethod == 'area') {
      const areaFrom = document.getElementById("area_from").value;
      const areaTo = document.getElementById("area_to").value;
      selection = new AreaSelectionStrategy(cpuModel, selectionMode, areaFrom, areaTo);
   }
   else if (selectionMethod == 'edges') {
      const edges_number = document.getElementById("edges_number").value;
      selection = new EdgesSelectionStrategy(cpuModel, selectionMode, edges_number)
   }
   if (selectionMode == 'clean') 
      appliedSelections = [selection];
   else
      appliedSelections.push(selection);

   applySelections();
}