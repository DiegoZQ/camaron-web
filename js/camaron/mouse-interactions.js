"use strict";

/*--------------------------------------------------------------------------------------
---------------------------------- MOUSE INTERACTIONS ----------------------------------
----------------------------------------------------------------------------------------

These functions are used for mouse operations such as moving, rotating and scalating.
The binding of the functions with the canvas is included here.
--------------------------------------------------------------------------------------*/

const mousedown = (event) => {
   const rect = canvas.getBoundingClientRect();
   const x = event.clientX - rect.left;
   const y = event.clientY - rect.top;
   if (event.button == 0) {
      rotating = true;
      rotator.setRotationStart(x, y);
   } else if (event.button == 2) {
      moving = true;
      translator.setMovementStart(x, y);
   }
}

const mouseup = () => {
   rotating = false;
   moving = false;
}

const mousemove = (event) => {
   const rect = canvas.getBoundingClientRect();
   const x = event.clientX - rect.left;
   const y = event.clientY - rect.top;
   if (rotating) {
      rotator.rotateTo(x, y);
      mvpManager.rotation = rotator.rotationMatrix;
      draw();
   }
   if (moving) {
      translator.moveTo(x, y);
      mvpManager.translation = translator.movementVector;
      draw();
   }
}

const onwheel = (event) => {
   event.preventDefault();
   scalator.scale(0.1 * -Math.sign(event.deltaY));
   mvpManager.scale = scalator.scaleFactor;
   scaleInfo.value = scalator.scaleFactor.toFixed(1);
   draw();
}

const updateEventHandlers = () => {
   canvas.addEventListener("mousedown", mousedown);
   canvas.addEventListener("mouseup", mouseup);
   canvas.addEventListener("mousemove", mousemove);
   canvas.addEventListener("wheel", onwheel);
   canvas.addEventListener("contextmenu", (event) => event.preventDefault());
}