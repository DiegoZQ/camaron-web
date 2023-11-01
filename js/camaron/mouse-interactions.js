/*--------------------------------------------------------------------------------------
---------------------------------- MOUSE INTERACTIONS ----------------------------------
----------------------------------------------------------------------------------------

These functions are used for mouse operations such as moving, rotating and scalating.
The binding of the functions with the canvas is included here.
--------------------------------------------------------------------------------------*/

const mousedown = (globalVars) => {
    const canvas = globalVars.canvas;
    const rotator = globalVars.rotator;
    const translator = globalVars.translator;

    const handler = (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (event.button == 0) {
            globalVars.rotating = true;
            rotator.setRotationStart(x, y);
        } else if (event.button == 2) {
            globalVars.moving = true;
            translator.setMovementStart(x, y);
        }
    }
    return handler
}

const mouseup = (globalVars) => {

    const handler = () => {
        globalVars.rotating = false;
        globalVars.moving = false;
    }
    return handler
}

const mousemove = (globalVars, draw) => {
    const gpuModel = globalVars.gpuModel;
    const rotator = globalVars.rotator;
    const translator = globalVars.translator;
    const canvas = globalVars.canvas;
    let rotating = globalVars.rotating;
    let moving = globalVars.moving;

    const handler = (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (rotating) {
            rotator.rotateTo(x, y);
            gpuModel.MVPManager.rotation = rotator.rotationMatrix;
            draw();
        }
        if (moving) {
            translator.moveTo(x, y);
            gpuModel.MVPManager.translation = translator.movementVector;
            draw();
        }
    }
    return handler;
}

const onwheel = (globalVars, draw) => {
    const gpuModel = globalVars.gpuModel;
    const scaleInfo = globalVars.scaleInfo;

    const handler = (event) => {
        event.preventDefault();
        scalator.scale(0.1 * -Math.sign(event.deltaY));
        gpuModel.scale = scalator.scaleFactor;
        scaleInfo.value = scalator.scaleFactor.toFixed(1);
        draw();
    }
    return handler;
}

export const updateEventHandlers = (globalVars, draw) => {
    const canvas = globalVars.canvas;

    canvas.addEventListener("mousedown", mousedown(globalVars));
    canvas.addEventListener("mouseup", mouseup(globalVars));
    canvas.addEventListener("mousemove", mousemove(globalVars, draw));
    canvas.addEventListener("wheel", onwheel(globalVars, draw));
    canvas.addEventListener("contextmenu", (event) => {event.preventDefault();})
}