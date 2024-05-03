const isWindow = (obj) => {
    return obj !== null && obj === obj.window;
}

const getWindow = (elem) => {
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
}

const offset = (elem) => {
    let box = {top: 0, left: 0};
    const doc = elem && elem.ownerDocument;
    const docElem = doc.documentElement;

    if (typeof elem.getBoundingClientRect !== typeof undefined) {
        box = elem.getBoundingClientRect();
    }
    const win = getWindow(doc);
    return {
        top: box.top + win.pageYOffset - docElem.clientTop,
        left: box.left + win.pageXOffset - docElem.clientLeft
    };
}

// Convierte un valor de defaultColorConfig o colorConfig usando su key, a su formato
// rgb css. Ej: (1,1,1,1) => rgb(255,255,255)
const parseColorConfigValueToRgb = (colorConfig, key) => {
    const rgbValues = colorConfig[key].slice(0,3).map(value => parseInt(value*255));
    return `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`;
}

// Actualiza cada campo de colorConfig con su respectivo valor asociado en el backgroundColor de los color-indicators
// y redibuja el modelo con este nuevo colorConfig. 
const updateColorConfig = () => {
    const colorMap = {
        baseColor: "face_color",
        selectedColor: "selected_face_color",
        wireFrameColor: "wireframe_color",
        faceNormalColor: "face_normals_color",
        vertexNormalColor: "vertex_normals_color",
        vertexCloudColor: "vertex_cloud_color"
    }
    Object.keys(colorConfig).forEach(key => {
        const keyId = colorMap[key];
        if (!keyId) return;
        const colorIndicator = document.getElementById(keyId).querySelector(".color-indicator");
        const rgbValues = parseRGB(colorIndicator.style.backgroundColor);
        colorConfig[key][0] = rgbValues[0] / 255; 
        colorConfig[key][1] = rgbValues[1] / 255;
        colorConfig[key][2] = rgbValues[2] / 255;
    });
    if (mainRenderer) {
        mainRenderer.updateColor();
    }
    draw();
}

// Regresa el color de cada color-indicator a su estado inicial dado por defaultColorConfig.
const resetColorIndicators = () => {
    const colorMap = {
        baseColor: "face_color",
        selectedColor: "selected_face_color",
        wireFrameColor: "wireframe_color",
        faceNormalColor: "face_normals_color",
        vertexNormalColor: "vertex_normals_color",
        vertexCloudColor: "vertex_cloud_color"
    }
    Object.keys(defaultColorConfig).forEach(key => {
        const keyId = colorMap[key];
        if (!keyId) return;
        const colorIndicator = document.getElementById(keyId).querySelector(".color-indicator");
        colorIndicator.style.backgroundColor = parseColorConfigValueToRgb(defaultColorConfig, key);
    });
    const backgroundColorIndicator = document.querySelector('#background_color .color-indicator');
    backgroundColorIndicator.style.backgroundColor = defaultBackgroundColor;
}

const elements = {
    background: null,
    hue_bar: null,
    sat_rect: null,
    color_indicator: null,
    previous_color_config: null,
    previous_color: null,
    actual_color: null,
    sat_picker: null,
    hue_picker: null,
};
let color;
let sat_width;
let sat_height;
let hue_width;

const calculatedByHex = {
    background_color: null,
    face_color: null,
    selected_face_color: null,
    wireframe_color: null,
    face_normals_color: null,
    vertex_normals_color: null,
    vertex_cloud_color: null
}

const updatePickedColor = () => {
    elements.hue_picker.style.background = "hsl( " + color[0] + ",100%, 50% )";
    elements.sat_picker.style.background = "hsl( " + color[0] + "," + color[1] + "%," + color[2] + "% )";
    elements.color_indicator.style.background = "hsl( " + color[0] + "," + color[1] + "%," + color[2] + "% )";
    elements.actual_color.style.background = elements.color_indicator.style.background;
    const activeInterface = document.querySelector('li[name="interface_color"].active');
    if (!calculatedByHex[activeInterface.id]) {
        const rgb_color = parseRGB(elements.color_indicator.style.backgroundColor);
        const hex_color = rgbToHex(rgb_color[0], rgb_color[1], rgb_color[2]);
        document.querySelector(".bottom input").value = hex_color;
    } else {
        document.querySelector(".bottom input").value = calculatedByHex[activeInterface.id];
    }   
}

// Configura el previous_color que debería tener la interfaz activa o clickeada, utilizando el último colorConfig guardado 
const setInterfacePreviousColor = (interface) => {
    if (interface.id === 'background_color') {
        elements.previous_color.style.backgroundColor = elements.background.style.backgroundColor;
    } else {
        const colorMap = {
            face_color: "baseColor",
            selected_face_color: "selectedColor",
            wireframe_color: "wireFrameColor",
            face_normals_color: "faceNormalColor",
            vertex_normals_color: "vertexNormalColor",
            vertex_cloud_color: "vertexCloudColor"
        } 
        elements.previous_color.style.backgroundColor = parseColorConfigValueToRgb(colorConfig, colorMap[interface.id]);
    }
}

// Actualiza la posición y el color de las componentees hue y sat. Se llama luego de haber modificado la variable color.
const updateComponentsState = () => {
    // Position
    // Hue
    const hue_bar_position = {
        left: offset(elements.sat_rect).left
    };
    const ePageX = ((color[0]/360) * hue_width) + hue_bar_position.left;
    elements.hue_picker.style.left = segmentNumber(((ePageX - hue_bar_position.left) / hue_width) * 100, 0, 100) + "%";
    elements.sat_rect.style.background = "hsl(" + color[0] + ", 100%, 50%)";
    // Sat
    const position0 = segmentNumber((color[1] / 100) * sat_width, 0, sat_width);
    const position1 = segmentNumber((1 - ((color[2] / 100) / (2 - (position0 / sat_width)))*2)*sat_height, 0, sat_height);
    elements.sat_picker.style.left = position0 + "px";
    elements.sat_picker.style.top = position1 + "px";

    // Color
    updatePickedColor();
}

// Recalcula la variable color luego de mover el hue picker mediante un evento e.
const setHuePickerValue = (e) => {
    const hue_bar_position = {
        left: offset(elements.sat_rect).left
    };
    color[0] = segmentNumber(Math.floor((((e.pageX - hue_bar_position.left) / hue_width) * 360)), 0, 360);
    elements.hue_picker.style.left = segmentNumber(((e.pageX - hue_bar_position.left) / hue_width) * 100, 0, 100) + "%";
    elements.sat_rect.style.background = "hsl(" + color[0] + ", 100%, 50%)";
    const activeInterface = document.querySelector('li[name="interface_color"].active');
    calculatedByHex[activeInterface.id] = false;
    updatePickedColor();
}
// Recalcula la variable color luego de mover el sat picker mediante un evento e.
const setSatPickerValue = (e) => {
    const rect_position = {
        left: offset(elements.sat_rect).left,
        top: offset(elements.sat_rect).top
    };
    const position = [
        segmentNumber(e.pageX - rect_position.left, 0, sat_width),
        segmentNumber(e.pageY - rect_position.top, 0, sat_height)
    ];
    elements.sat_picker.style.left = position[0] + "px";
    elements.sat_picker.style.top = position[1] + "px";
    color[1] = Math.floor(((position[0] / sat_width) * 100));
    //convert between hsv and hsl 
    const hsvValue = 1 - (position[1] / sat_height); 
    const hsvSaturation = position[0] / sat_width; 
    const lightness = (hsvValue / 2) * (2 - hsvSaturation); 
    color[2] = Math.floor(lightness * 100);
    const activeInterface = document.querySelector('li[name="interface_color"].active');
    calculatedByHex[activeInterface.id] = false;
    updatePickedColor();
}

const changeHex = (hex_val) => {
    const rgb_val = hexToRgb(hex_val);
    if (rgb_val !== null) {
        const activeInterface = document.querySelector('li[name="interface_color"].active');
        calculatedByHex[activeInterface.id] = hex_val;
        color = rgbToHsl([rgb_val.r, rgb_val.g, rgb_val.b]);
        updateComponentsState();
    }
}

// HANDLERS
let hue_drag_started = false;
let sat_drag_started = false;

const hueBarHandleMouseDown = (e) => {
    hue_drag_started = true;
    elements.hue_picker.classList.add("active");
    setHuePickerValue(e);
}
const satRectHandleMouseDown = (e) => {
    sat_drag_started = true;
    elements.sat_picker.classList.add("active");
    setSatPickerValue(e);
}
const handleMouseMove = (e) => {
    //COLOR DRAG MOVE
    if (sat_drag_started) {
        setSatPickerValue(e);
    }
    //LINE DRAG MOVE
    if (hue_drag_started) {
        setHuePickerValue(e);
    }
}
const handleMouseUp = () => {
    if (sat_drag_started) {
        elements.sat_picker.classList.remove("active");
        sat_drag_started = false;
    }
    if (hue_drag_started) {
        elements.hue_picker.classList.remove("active");
        hue_drag_started = false;
    }
}

// Se ejecuta cada vez que se muestra el modal de colores.
$('#modal-colors').on('shown', function() {

    elements.background = document.getElementById("model-view");
    elements.hue_bar = document.querySelector(".hue_bar");
    elements.sat_rect = document.querySelector(".sat_rect");
    elements.color_indicator = document.querySelector('li[name="interface_color"].active .color-indicator');
    elements.previous_color = document.querySelector('.color_preview .previous_color');
    elements.actual_color = document.querySelector('.color_preview .actual_color');
    elements.sat_picker = document.querySelector(".sat_picker");
    elements.hue_picker = document.querySelector(".hue_picker");
    
    sat_width = elements.sat_rect.offsetWidth;
    sat_height = elements.sat_rect.offsetHeight;
    hue_width = elements.hue_bar.offsetWidth;

    let activeInterface = document.querySelector('li[name="interface_color"].active');
    setInterfacePreviousColor(activeInterface);
    elements.actual_color.style.backgroundColor = elements.previous_color.style.background;

    // gets active interface and set ups everything
    color = rgbToHsl(parseRGB(elements.color_indicator.style.backgroundColor));
    updateComponentsState();
    
    $('li[name="interface_color"]').click(function() {
        const clickedInterface = this;
        activeInterface = document.querySelector('li[name="interface_color"].active');
            
        if (activeInterface != clickedInterface) {  
            activeInterface.classList.remove('active');
            clickedInterface.classList.add('active');

            const colorIndicator = clickedInterface.querySelector('.color-indicator');
            elements.color_indicator = colorIndicator;
            setInterfacePreviousColor(clickedInterface);
            elements.actual_color.style.backgroundColor = elements.color_indicator.style.backgroundColor;
            const rgb = parseRGB(colorIndicator.style.backgroundColor);
            const [h, s, l] = rgbToHsl(rgb);
            color[0] = h; color[1] = s; color[2] = l;

            updateComponentsState();
        }
    });
    $('#save_btn').click(function(){
        updateColorConfig();
        const backgroundColorIndicator = document.querySelector('#background_color .color-indicator');
        elements.background.style.backgroundColor = backgroundColorIndicator.style.backgroundColor;
		$('.modal.active').delay(150).fadeOut().removeClass('active');
		$('.modal-container').toggleClass('bottom-in bottom-out');
        $(this).trigger('hidden');
	});
    $('#reset_btn').click(function() {
        resetColorIndicators();
        activeInterface = document.querySelector('li[name="interface_color"].active');
        const colorIndicator = activeInterface.querySelector('.color-indicator');
        const rgb = parseRGB(colorIndicator.style.backgroundColor);
        const [h, s, l] = rgbToHsl(rgb);
        color[0] = h; color[1] = s; color[2] = l;
        updateComponentsState();
    })
    $('.basic_color').click(function() {
        const clickedBasicColor = this; 
        const rgb = parseRGB(clickedBasicColor.style.backgroundColor);
        const [h, s, l] = rgbToHsl(rgb);
        color[0] = h; color[1] = s; color[2] = l;
        const activeInterface = document.querySelector('li[name="interface_color"].active');
        calculatedByHex[activeInterface.id] = null;
        updateComponentsState();
    })

    elements.hue_bar.addEventListener('mousedown', hueBarHandleMouseDown);
    elements.sat_rect.addEventListener('mousedown', satRectHandleMouseDown);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);    
})

$('#modal-colors').on('hidden', function() {
    // Remove all event listeners when the modal is hidden
    elements.hue_bar.removeEventListener('mousedown', hueBarHandleMouseDown);
    elements.sat_rect.removeEventListener('mousedown', satRectHandleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    $('li[name="interface_color"]').off('click');
    $('#reset_btn').off('click');
    $('#save_btn').off('click');
    $('.basic_color').off('click');
});