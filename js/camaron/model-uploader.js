"use strict";

// requires "../fileloader/OffLoadStrategy";
// requires "../model/GPUModel";
// requires "../ui/rotator";
// requires "../ui/scalator";
// requires "../ui/translator";
// requires "./view-helpers";
// requires "./selection";
// requires "./mouse-interactions";


/*--------------------------------------------------------------------------------------
--------------------------------- OPEN FILE/DRAW MODEL ---------------------------------
--------------------------------------------------------------------------------------*/

// Opens the loading modal.
const openLoadingModal = () => {
   const loadingModal = $('#modal-loading');
   loadingModal.fadeIn().addClass('active');
   loadingModal.find('.modal-container').removeClass('bottom-out').addClass('bottom-in');
};

// Closes the loading modal.
const closeLoadingModal = () => {
   const loadingModal = $('#modal-loading');
   loadingModal.delay(150).fadeOut().removeClass('active').find('.modal-container').toggleClass('bottom-in bottom-out');
};

// Selects loading strategy
const selectLoadingStrategy = (extension, fileArray) => {
   if (extension === 'off') 
      return new OffLoadStrategy(fileArray);
   alert('Unsupported Format');
   // TODO: Implement a null loader
};

// Waits for the gpuModel to be loaded
const waitForGpuModelLoaded = () => {
   // If its fully loaded, sets the renderers
   if (gpuModel && gpuModel.loaded === 7) {
      setMainRenderer();
      setSecondaryRenderers();
      updateInfo();
      draw();
      enableModelDependant();
      updateEventHandlers();
      closeLoadingModal();
   // else waits 0.5 seconds
   } else {
      setTimeout(waitForGpuModelLoaded, 500);
   } 
};

// Initializes gpuModel loading and waits for it to be loaded
const loadGpuModel = () => {
   setTimeout(() => {
      gpuModel.loadTriangles();
      gpuModel.loadTrianglesNormals();
      gpuModel.loadVertexNormals();
      gpuModel.loadEdges();
      gpuModel.loadVertices();
      gpuModel.loadVertexNormalsLines();
      gpuModel.loadFaceNormalsLines();
   }, 0);
   changeViewType();
   rotator = new Rotator();
   translator = new Translator();
   scalator = new Scalator();
   
   waitForGpuModelLoaded();
};

// Here is were everything gets initialized.
const uploadFileHandler = (file) => {
    
   const handler = () => {
      if (!file.files.length)
         return;
      const extension = file.files[0].name.split('.')[1];
      openLoadingModal();

      const handleFileLoad = (event) => {
         setTimeout(() => {
            mainView.classList.remove('view2');
            mainView.classList.add('view0');
            disableEvaluationDependant();
            appliedSelections = [];
            updateActiveSelections();

            const fileArray = event.target.result.split('\n');
            const loader = selectLoadingStrategy(extension, fileArray);

            if (loader) {
               cpuModel = loader.load();
               if (loader.isValid) {
                  gpuModel = new GPUModel(cpuModel);
                  loadGpuModel(gpuModel);
               } else {
                  alert('Invalid format');
               } 
            }
         }, 400); // 400ms delay after opening the file
      };
      const reader = new FileReader();
      reader.onloadend = handleFileLoad;
      reader.readAsBinaryString(file.files[0]);
   }
   return handler;
}