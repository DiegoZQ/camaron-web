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
   
   for (const appliedSelection of appliedSelections) {
      appliedSelection.apply();
   }
   if (mainRenderer) {
      mainRenderer.updateColor();
   }
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

const applyButtonHandler = (e) => {
   if (e.target.classList.contains('disabled')) {
      return;
   }
   const selectionMethod = document.querySelector("#selection-type .button").getAttribute('value');
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
      selection = new IdSelectionStrategy(model, selectionMode, idFrom, idTo, list);
   } 
   else if (selectionMethod == 'angle') {
      const angleFrom = document.getElementById("angle_from").value;
      const angleTo = document.getElementById("angle_to").value;
      selection = new AngleSelectionStrategy(model, selectionMode, angleFrom, angleTo);
   }
   else if (selectionMethod == 'angle2') {
      const angleFrom = document.getElementById("angle_from2").value;
      const angleTo = document.getElementById("angle_to2").value;
      selection = new AngleSelectionStrategy(model, selectionMode, angleFrom, angleTo);
   }
   else if (selectionMethod == 'area') {
      const areaFrom = document.getElementById("area_from").value;
      const areaTo = document.getElementById("area_to").value;
      selection = new AreaSelectionStrategy(model, selectionMode, areaFrom, areaTo);
   }
   else if (selectionMethod == 'volume') {
      const volumeFrom = document.getElementById("volume_from").value;
      const volumeTo = document.getElementById("volume_to").value;
      selection = new VolumeSelectionStrategy(model, selectionMode, volumeFrom, volumeTo);
   } 
   else if (selectionMethod == 'aspect-ratio') {
      const aspectRatioFrom = document.getElementById("aspect_ratio_from").value;
      const aspectRatioTo = document.getElementById("aspect_ratio_to").value;
      selection = new AspectRatioSelectionStrategy(model, selectionMode, aspectRatioFrom, aspectRatioTo);
   }
   else if (selectionMethod == 'edges') {
      const edges_number = document.getElementById("edges_number").value;
      selection = new EdgesSelectionStrategy(model, selectionMode, edges_number)
   }
   if (selectionMode == 'clean') 
      appliedSelections = [selection];
   else
      appliedSelections.push(selection);

   // Finalmente cambia el estado de la variable global hideUnselected dependiendo si está seleccionada en el checkbox.
   const hideUnselectedCheckbox = document.getElementById('hide-unselected')
   hideUnselected = hideUnselectedCheckbox.checked;

   applySelections();
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
         {value: 'aspect-ratio', dataImg: 'img/icon-ev-edges.svg', text: 'By Polygons Aspect Ratio', evaluation: true},
         {value: 'id', dataImg: 'img/img-id.svg', text: 'By Polygon ID', evaluation: false}
      ]
   } else if (model.modelType === 'PolyhedronMesh') {
      options = [
         {value: 'angle2', dataImg: 'img/icon-ev-angles.svg', text: 'By Polyhedron Solid Angles', evaluation: true},
         {value: 'area', dataImg: 'img/icon-ev-area.svg', text: 'By Polyhedron Area', evaluation: true},
         {value: 'volume', dataImg: 'img/icon-ev-area.svg', text: 'By Polyhedron Volume', evaluation: true},
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