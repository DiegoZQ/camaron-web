const cuttingPlaneElements = {
    plane_position_bar: document.querySelector(".plane_position_bar"), // Barra de posición
    plane_position_picker: document.querySelector(".plane_position_picker"), // Picker de posición
    dWidth: null,  
    dHeight: null,
    dDepth: null,
    plane_buttons: document.querySelectorAll('.plane_button'), // Botones que cambian la orientación o el eje del plano
    axis: null, // Ej por donde se mueve el plano
    reverse: false // Orientación del plano
}

// Filtra todos los poliedros cuya posición de alguno de sus vértices esté con una orientación negativa
// respecto al plano que corta.
const filterByPlanePosition = (position) => {
    if (!cuttingPlaneRenderer || !model || (model && model.modelType !== 'PolyhedronMesh')) {
        return;
    }
    const a = cuttingPlaneElements.axis == 'x' ? 1 : 0;
    const b = cuttingPlaneElements.axis == 'y' ? 1 : 0;
    const c = cuttingPlaneElements.axis == 'z' ? 1 : 0;
    const d = position;

    for (const polygon of model.polygons) {
        polygon.isVisible = true;
    }
    for (const polyhedron of model.polyhedrons) {
        polyhedron.isVisible = true;
    }
    for (const polyhedron of model.polyhedrons) {
        for (const vertex of polyhedron.vertices) {
            const orientation = vertex.orientationInPlane(a, b, c, d);
            if (orientation === cuttingPlaneElements.reverse) {
                polyhedron.isVisible = false;
                for (const polygon of polyhedron.polygons) {
                    polygon.isVisible = false;
                }
                break;
            }
        }
    }
}

// Asigna la traslación en el eje dado un porcentaje de posición del plane position picker y también filtra
// los poliedros del modelo dada la posición del plano luego de la traslación.
const setPlanePositionByPercent = (percent) => {
    if (!percent) {
        percent = cuttingPlaneElements.plane_position_picker.style.top.slice(0, -1);
    }
    if (cuttingPlaneElements.axis == 'x') {
        const scaledPercent = scaleValue(percent, 0, 100, 0, model.modelWidth + 2*cuttingPlaneElements.dWidth);
        const position = (model.bounds[0] - cuttingPlaneElements.dWidth) + scaledPercent;
        filterByPlanePosition(position);
        cuttingPlaneRenderer.translation = [scaledPercent, 0, 0];
    }
    else if (cuttingPlaneElements.axis == 'y') {
        const scaledPercent = scaleValue(percent, 0, 100, 0, model.modelHeight + 2*cuttingPlaneElements.dHeight);
        const position = (model.bounds[1] - cuttingPlaneElements.dHeight) + scaledPercent;
        filterByPlanePosition(position);
        cuttingPlaneRenderer.translation = [0, scaledPercent, 0];
    }
    else if (cuttingPlaneElements.axis == 'z') {
        const scaledPercent = scaleValue(percent, 0, 100, 0, model.modelDepth + 2*cuttingPlaneElements.dDepth);
        const position = (model.bounds[2] - cuttingPlaneElements.dDepth) + scaledPercent;
        filterByPlanePosition(position);
        cuttingPlaneRenderer.translation = [0, 0, scaledPercent];
    }
}

// Asigna la traslación en el eje dado un cambio "e" en la posición del plane position picker,
// además de aplicar dicho cambio también en la interfaz visual. También filtra
// los poliedros del modelo dada la posición del plano luego de la traslación y finalmente dibuja
// el modelo resultante junto con el plano que corta.
const setPlanePosition = (e) => {
    if (!cuttingPlaneRenderer || !mainRenderer) return;
    const barTop = offset(cuttingPlaneElements.plane_position_bar).top;
    const barHeight = cuttingPlaneElements.plane_position_bar.offsetHeight;
    const percent = segmentNumber(((e.pageY - barTop) / barHeight) * 100, 0, 100);
    cuttingPlaneElements.plane_position_picker.style.top = percent + "%";
    setPlanePositionByPercent(percent);
    if (mainRenderer) {
        mainRenderer.updateColor();
    }
    draw();
    cuttingPlaneRenderer.draw();
}
    
// Crea un renderer del plano que corta cuya posición se orienta según el valor de cuttingPlaneElements.axis.
const setCuttingPlaneRenderer = () => {
    if (!model || !mvpManager) return;
    // Crea una malla simple con un cuadrado para representar el cutting plane.
    const cuttingPlane = new PolygonMesh();
    const maxDimension = Math.max(model.modelWidth, model.modelHeight, model.modelDepth);
    const xscale = cuttingPlaneElements.axis == 'x' ? 0.01 : 0.1;
    const yscale = cuttingPlaneElements.axis == 'y' ? 0.01 : 0.1;
    const zscale = cuttingPlaneElements.axis == 'z' ? 0.01 : 0.1;
    cuttingPlaneElements.dWidth = model.modelWidth == 0 ? maxDimension * xscale : model.modelWidth * xscale;
    cuttingPlaneElements.dHeight = model.modelHeight == 0 ? maxDimension * yscale : model.modelHeight * yscale;
    cuttingPlaneElements.dDepth = model.modelDepth == 0 ? maxDimension * zscale : model.modelDepth * zscale;
    const dWidth = cuttingPlaneElements.dWidth;
    const dHeight = cuttingPlaneElements.dHeight;
    const dDepth = cuttingPlaneElements.dDepth;
    let v1, v2, v3, v4;

    if (cuttingPlaneElements.axis == 'x') {
        v1 = new Vertex(1, model.bounds[0] - dWidth, model.bounds[1] - dHeight, model.bounds[2] - dDepth);
        v2 = new Vertex(2, model.bounds[0] - dWidth, model.bounds[4] + dHeight, model.bounds[2] - dDepth);
        v3 = new Vertex(3, model.bounds[0] - dWidth, model.bounds[4] + dHeight, model.bounds[5] + dDepth);
        v4 = new Vertex(4, model.bounds[0] - dWidth, model.bounds[1] - dHeight, model.bounds[5] + dDepth);
    }
    else if (cuttingPlaneElements.axis == 'y') {
        v1 = new Vertex(1, model.bounds[0] - dWidth, model.bounds[1] - dHeight, model.bounds[2] - dDepth);
        v2 = new Vertex(2, model.bounds[3] + dWidth, model.bounds[1] - dHeight, model.bounds[2] - dDepth);
        v3 = new Vertex(3, model.bounds[3] + dWidth, model.bounds[1] - dHeight, model.bounds[5] + dDepth);
        v4 = new Vertex(4, model.bounds[0] - dWidth, model.bounds[1] - dHeight, model.bounds[5] + dDepth);
    }
    else if (cuttingPlaneElements.axis == 'z') {
        v1 = new Vertex(1, model.bounds[0] - dWidth, model.bounds[1] - dHeight, model.bounds[2] - dDepth);
        v2 = new Vertex(2, model.bounds[3] + dWidth, model.bounds[1] - dHeight, model.bounds[2] - dDepth);
        v3 = new Vertex(3, model.bounds[3] + dWidth, model.bounds[4] + dHeight, model.bounds[2] - dDepth);
        v4 = new Vertex(4, model.bounds[0] - dWidth, model.bounds[4] + dHeight, model.bounds[2] - dDepth);
    }
    const p1 = new Polygon(0);
    for (const vertex of [v1, v2, v3, v4]) {
        vertex.polygons.push(p1);
        p1.vertices.push(vertex);
    }
    cuttingPlane.vertices = [v1,v2,v3,v4];
    cuttingPlane.polygons = [p1];
    cuttingPlane.loadTriangles();
    cuttingPlaneRenderer = new CuttingPlaneRenderer(mvpManager, cuttingPlane);
    cuttingPlaneRenderer.init();
}

// HANDLERS
let plane_position_drag_started = false;

const planePositionBarHandleMouseDown = (e) => {
    plane_position_drag_started = true;
    cuttingPlaneElements.plane_position_picker.classList.add("active");
    setPlanePosition(e);
}

const handlePlanePositionMouseMove = (e) => {
    //COLOR DRAG MOVE
    if (plane_position_drag_started) {
        setPlanePosition(e);
    }
}
const handlePlanePositionMouseUp = () => {
    if (plane_position_drag_started) {
        cuttingPlaneElements.plane_position_picker.classList.remove("active");
        plane_position_drag_started = false;
        draw();
    }
}

// Cambia la orientación y el eje en el cual se mueve el plano dependiendo de la opción escogida.
const handlePlaneButtonClick = (e) => {
    const planeButton = e.target.closest('.plane_button');
    // Si el botón está desactivado o activo, no hace nada.
    if (planeButton.classList.contains('disabled') || planeButton.classList.contains('active')) {
        return;
    }
    // Si el botón es uno que cambia la posición de un eje
    if (['x', 'y', 'z'].includes(planeButton.getAttribute('value'))) {
        // Quita el estado activado de las otras opciones y se la asigna a este botón
        cuttingPlaneElements.plane_buttons.forEach(planeButton => planeButton.classList.remove('active'));
        planeButton.classList.add('active');
        // Luego asigna el valor del eje dado por el botón
        cuttingPlaneElements.axis = planeButton.getAttribute('value');
        // Y genera un nuevo renderer del plano que corta en base a dicho eje
        setCuttingPlaneRenderer();
    }
    // Si el botón no es uno que cambia de posición (es decir, es el botón de reversa) 
    else {
        // Invierte el valor de la orientación del plano
        cuttingPlaneElements.reverse = !cuttingPlaneElements.reverse;
    }
    // Finalmente asigna la posición y orientación del nuevo plano y dibuja el modelo resultante
    setPlanePositionByPercent();
    if (mainRenderer) {
        mainRenderer.updateColor();
    }
    draw();
}

// Inicializa el renderer del plano que corta además de agregar los event listeners para interactuar con él 
const setCuttingPlane = () => {
    // Reinicia el estado del anterior cutting plane y quita los event listeners anteriores.
    cuttingPlaneElements.plane_position_bar.classList.add('disabled');
    cuttingPlaneElements.plane_position_picker.style.top = '0%';
    cuttingPlaneElements.plane_position_bar.removeEventListener('mousedown', planePositionBarHandleMouseDown);    
    document.removeEventListener('mousemove', handlePlanePositionMouseMove);
    document.removeEventListener('mouseup', handlePlanePositionMouseUp);  
    cuttingPlaneElements.plane_buttons.forEach(planeButton => {
        planeButton.classList.remove('active');
        planeButton.classList.add('disabled');
    });
    cuttingPlaneElements.plane_buttons.forEach(planeButton => planeButton.removeEventListener('click', handlePlaneButtonClick));

    // Retorna si el modelo no es una malla de poliedros.
    if (!model || (model && model.modelType !== 'PolyhedronMesh') || !mvpManager) return;

    // Activa la interfaz para poder mover el plano y seleccionar botones.
    cuttingPlaneElements.plane_position_bar.classList.remove('disabled');
    cuttingPlaneElements.plane_position_bar.addEventListener('mousedown', planePositionBarHandleMouseDown);    
    document.addEventListener('mousemove', handlePlanePositionMouseMove);
    document.addEventListener('mouseup', handlePlanePositionMouseUp);      
    cuttingPlaneElements.plane_buttons.forEach(planeButton => planeButton.classList.remove('disabled'));
    cuttingPlaneElements.plane_buttons[0].classList.add('active');
    cuttingPlaneElements.axis = cuttingPlaneElements.plane_buttons[0].getAttribute('value');
    cuttingPlaneElements.plane_buttons.forEach(planeButton => planeButton.addEventListener('click', handlePlaneButtonClick));
    setCuttingPlaneRenderer();
}