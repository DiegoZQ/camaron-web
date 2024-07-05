"use strict";

// requires "../fileloader/OffLoadStrategy";
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
const selectLoadingStrategy = (files) => {
   if (Object.keys(files).length === 1) {
      if (files.off) 
         return new OffLoadStrategy(files.off);
      if (files.visf)
         return new VisfLoadStrategy(files.visf);
      if (files.poly)
         return new PolyLoadStrategy(files.poly);
      if (files.node)
         return new NodeLoadStrategy(files.node);
   } else if (Object.keys(files).length === 2) {
      if (files.node && files.face)
         return new NodeFaceLoadStrategy(files.node, files.face);
      if (files.node && files.ele)
         return new NodeEleLoadStrategy(files.node, files.ele);
   }
   closeModal('modal-loading');
   openModal('modal-error', 'Unsupported File Format');
};

// Waits for the model to be loaded
const waitForModelLoaded = () => {
   // If its fully loaded, sets the renderers
   if (model && model.loaded) {
      setHeaderStartConfiguration();
      setMainRenderer();
      setSecondaryRenderers();
      setCuttingPlane();
      setSelectionAndEvaluationOptions();
      updateInfo();
      draw();
      enableModelDependant();
      updateEventHandlers();
      closeModal('modal-loading');
   // else waits 0.5 seconds
   } else {
      setTimeout(waitForModelLoaded, 500);
   } 
};

// Initializes model loading and waits for it to be loaded
const initModelView = () => {
   setTimeout(() => {
      model.loadBuffers();
      mvpManager = new MVPManager(model);
   }, 0);
   changeViewType();
   rotator = new Rotator();
   translator = new Translator();
   scalator = new Scalator();
   waitForModelLoaded();
};

const readFileAsText = (file) => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = (event) => {
         if (event.target.readyState === FileReader.DONE) {
            resolve(event.target.result.split('\n'));
         }
      };
      reader.onerror = (event) => {
         reject(new Error(`Error reading file: ${file.name}`));
      };
      reader.readAsText(file);
   });
};


// Here is were everything gets initialized.
const uploadFileHandler = (file) => {
      if (!file.files.length)
         return;
      if (file.files.length > 2) {
         openModal('modal-error', 'Too many files');
         return;
      }
      openModal('modal-loading');
      
      const files = Array.from(file.files).slice(0, 2);
      const fileExtensions = files.map(file => file.name.split('.').pop());
      const filePromises = files.map(readFileAsText);
      setTimeout(() => {
         Promise.all(filePromises).then(fileArrays => {
            mainView.classList.remove('view2');
            mainView.classList.add('view0');
            disableEvaluationDependant();
            appliedSelections = [];
            updateActiveSelections();
            const fileMap = Object.fromEntries(fileExtensions.map((fileExtensions, index) => [fileExtensions, fileArrays[index]]));
            loader = selectLoadingStrategy(fileMap);
            if (loader) {
               model = loader.doLoad();
               if (loader.isValid) {
                  initModelView();
               } else {
                  closeModal('modal-loading');
                  openModal('modal-error', 'Invalid File Content')
               } 
            }
         })
      }, 400);
}