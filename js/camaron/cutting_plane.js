const cuttingPlaneElements = {
    plane_position_bar: document.querySelector(".plane_position_bar"),
    plane_position_picker: document.querySelector(".plane_position_picker"),
    dWidth: null,
    dHeight: null,
    dDepth: null
}

const initCuttingPlaneRenderer = () => {
    if (!model || !mvpManager) return;
    const cuttingPlane = new PolygonMesh();
    const maxDimension = Math.max(model.modelWidth, model.modelHeight, model.modelDepth);
    cuttingPlaneElements.dWidth = model.modelWidth == 0 ? maxDimension * 0.1 : model.modelWidth * 0.1;
    cuttingPlaneElements.dHeight = model.modelHeight == 0 ? maxDimension * 0.1 : model.modelHeight * 0.1;
    cuttingPlaneElements.dDepth = model.modelDepth == 0 ? maxDimension * 0.01 : model.modelDepth * 0.01;
    const dWidth = cuttingPlaneElements.dWidth;
    const dHeight = cuttingPlaneElements.dHeight;
    const dDepth = cuttingPlaneElements.dDepth;
    const v1 = new Vertex(1, model.bounds[0] - dWidth, model.bounds[1] - dHeight, model.bounds[2] - dDepth);
    const v2 = new Vertex(2, model.bounds[3] + dWidth, model.bounds[1] - dHeight, model.bounds[2] - dDepth);
    const v3 = new Vertex(3, model.bounds[3] + dWidth, model.bounds[4] + dHeight, model.bounds[2] - dDepth);
    const v4 = new Vertex(4, model.bounds[0] - dWidth, model.bounds[4] + dHeight, model.bounds[2] - dDepth);
    const p1 = new Polygon(1);
    for (const vertex of [v1, v2, v3, v4]) {
        vertex.polygons.push(p1);
        p1.vertices.push(vertex);
    }
    cuttingPlane.vertices = [v1,v2,v3,v4];
    cuttingPlane.polygons = [p1];
    cuttingPlane.loadTriangles();
    const cuttingPlaneRenderer = new CuttingPlaneRenderer(mvpManager, cuttingPlane);
    cuttingPlaneRenderer.init();
    return cuttingPlaneRenderer;
}

// Recalcula la variable color luego de mover el hue picker mediante un evento e.
const setPlanePosition = (e) => {
    if (!cuttingPlaneRenderer) return;
    const barTop = offset(cuttingPlaneElements.plane_position_bar).top;
    const barHeight = cuttingPlaneElements.plane_position_bar.offsetHeight;
    const percent = segmentNumber(((e.pageY - barTop) / barHeight) * 100, 0, 100);
    cuttingPlaneElements.plane_position_picker.style.top = percent + "%";
    const scaledPercent = scaleValue(percent, 0, 100, 0, model.modelDepth + 2*cuttingPlaneElements.dDepth);
    const position = (model.bounds[2] - cuttingPlaneElements.dDepth) + scaledPercent;
    filterByPlanePosition(position);
    cuttingPlaneRenderer.translation = [0,0, scaledPercent];
    mainRenderer.updateColor();
    draw();
    cuttingPlaneRenderer.draw();
}
    

const filterByPlanePosition = (position) => {
    if (!model) return;
    const [a, b, c, d] = [0, 0, 1, position];

    for (const polygon of model.polygons) {
        polygon.isVisible = true;
    }
    for (const vertex of model.vertices) {
        if (!vertex.orientationInPlane(a, b, c, d)) {
            for (const polygon of vertex.polygons) {
                polygon.isVisible = false;
            }
        }
    }
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

cuttingPlaneElements.plane_position_bar.addEventListener('mousedown', planePositionBarHandleMouseDown);    
document.addEventListener('mousemove', handlePlanePositionMouseMove);
document.addEventListener('mouseup', handlePlanePositionMouseUp);  