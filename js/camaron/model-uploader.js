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

// Opens a modal by its id.
const openModal = (id, spanContent=null) => {
   const modal = $(`#${id}`);
   modal.fadeIn().addClass('active');
   if (spanContent)
      modal.find('.modal-body span').html(spanContent);
   modal.find('.modal-container').removeClass('bottom-out').addClass('bottom-in');
};

// Closes a modal by its id.
const closeModal = (id) => {
   const modal = $(`#${id}`);
   modal.delay(150).fadeOut().removeClass('active').find('.modal-container').toggleClass('bottom-in bottom-out');
};

// Selects loading strategy
const selectLoadingStrategy = (extension, fileArray) => {
   if (extension === 'off') 
      return new OffLoadStrategy(fileArray);
   if (extension === 'visf')
      return new VisfLoadStrategy(fileArray);
   if (extension === 'poly')
      return new PolyLoadStrategy(fileArray);
   closeModal('modal-loading');
   openModal('modal-error', 'Unsupported File Format');
};

// Waits for the gpuModel to be loaded
const waitForGpuModelLoaded = () => {
   // If its fully loaded, sets the renderers
   if (gpuModel && gpuModel.loaded) {
      setMainRenderer();
      setSecondaryRenderers();
      updateInfo();
      draw();
      enableModelDependant();
      updateEventHandlers();
      closeModal('modal-loading');
   // else waits 0.5 seconds
   } else {
      setTimeout(waitForGpuModelLoaded, 500);
   } 
};

// Initializes gpuModel loading and waits for it to be loaded
const loadGpuModel = () => {
   setTimeout(() => {
      gpuModel.load();
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
      const fileName = file.files[0].name.split('.');
      const extension = fileName[fileName.length-1];
      openModal('modal-loading');

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
                  closeModal('modal-loading');
                  openModal('modal-error', 'Invalid File Content')
               } 
            }
         }, 400); // 400ms delay after opening the file
      };
      const reader = new FileReader();
      reader.onloadend = handleFileLoad;
      reader.readAsText(file.files[0]);
   }
   return handler;
}