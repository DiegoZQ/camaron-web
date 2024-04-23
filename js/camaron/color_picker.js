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

const changeHex = (hex_val) => {
      
    const rgb_val = hexToRgb(hex_val);
  
    if (rgb_val !== null) {

        const hsl_val = rgbToHsl([rgb_val.r,rgb_val.g,rgb_val.b]);
        const hsv_val = rgbToHsv(rgb_val.r,rgb_val.g,rgb_val.b);
        
        color[0] = hsl_val[0];
        
        elements.sat_rect.style.background = "hsl(" + color[0] + ", 100%, 50%)";
        
        elements.hue_picker.style.top = hsl_val[0] / 360 * 100 + "%";
        elements.hue_picker.style.background = "hsl("+hsl_val[0]+", 100%, 50%)";
        elements.sat_picker.style.background = hex_val;
        document.querySelector(".color_preview").style.background = hex_val;
        
        elements.sat_picker.style.left = hsl_val[1] + "%";
        elements.sat_picker.style.top = 100 - ( hsv_val[2] * 100 ) + "%";     
    }
}

const updateColorConfig = () => {
    const colorMap = {
        baseColor: "main_render_color",
        wireFrameColor: "wireframe_color",
        faceNormalColor: "face_normals_color",
        vertexNormalColor: "vertex_normals_color",
        vertexCloudColor: "vertex_cloud_color"
    }
    Object.keys(colorConfig).forEach(key => {
        const keyId = colorMap[key];
        if (!keyId) return;
        const colorIndicator = document.getElementById(keyId).querySelector(".color-indicator");
        const backgroundColor = colorIndicator.style.backgroundColor;
        const rgbValues = parseRGB(backgroundColor);
        colorConfig[key][0] = rgbValues[0] / 255; // Normalize the RGB values to the range [0, 1]
        colorConfig[key][1] = rgbValues[1] / 255;
        colorConfig[key][2] = rgbValues[2] / 255;
    });
    if (mainRenderer) {
        mainRenderer.updateColor();
    }
    draw();
}

const elements = {
    hue_bar: null,
    sat_rect: null,
    color_preview: null,
    sat_picker: null,
    hue_picker: null,
    background_color_indicator: null
};
let color;
let sat_width;
let sat_height;
let hue_height;


const updateComponentsPosition = () => {
    // Hue
    const hue_bar_position = {
        top: offset(elements.sat_rect).top
    };
    const ePageY = ((color[0]/360) * hue_height) +  hue_bar_position.top;
    elements.hue_picker.style.top = segmentNumber(((ePageY - hue_bar_position.top) / hue_height) * 100, 0, hue_height / 1) + "%";
    elements.sat_rect.style.background = "hsl(" + color[0] + ", 100%, 50%)";

    // Sat
    const position0 = segmentNumber((color[1] / 100) * sat_width, 0, sat_width);
    const position1 = segmentNumber((1 - ((color[2] / 100) / (2 - (position0 / sat_width)))*2)*sat_height, 0, sat_height);
    elements.sat_picker.style.left = position0 + "px";
    elements.sat_picker.style.top = position1 + "px";
}

const returnPickedColor = () => {
    
    elements.hue_picker.style.background = "hsl( " + color[0] + ",100%, 50% )";
    elements.sat_picker.style.background = "hsl( " + color[0] + "," + color[1] + "%," + color[2] + "% )";
    elements.color_preview.style.background = "hsl( " + color[0] + "," + color[1] + "%," + color[2] + "% )";

    const rgb_color = hslToRgb(color[0], color[1], color[2]);
    const hex_color = rgbToHex(rgb_color[0], rgb_color[1], rgb_color[2]);
        
    document.querySelector(".bottom input").value = hex_color.toUpperCase();
}

const setHuePickerValue = (e) => {
    
    const hue_bar_position = {
        top: offset(elements.sat_rect).top
    };

    color[0] = segmentNumber(Math.floor((((e.pageY - hue_bar_position.top) / hue_height) * 360)), 0, 360);

    elements.hue_picker.style.top = segmentNumber(((e.pageY - hue_bar_position.top) / hue_height) * 100, 0, hue_height / 1) + "%";

    elements.sat_rect.style.background = "hsl(" + color[0] + ", 100%, 50%)";

    returnPickedColor();
}
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

    returnPickedColor();
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

    elements.hue_bar = document.querySelector(".hue_bar");
    elements.sat_rect = document.querySelector(".sat_rect");
    elements.color_preview = document.querySelector('li[name="interface_color"].active .color-indicator');
    elements.sat_picker = document.querySelector(".sat_picker");
    elements.hue_picker = document.querySelector(".hue_picker");
    elements.background_color_indicator = document.querySelector('#background_color .color-indicator')
    
    sat_width = elements.sat_rect.offsetWidth;
    sat_height = elements.sat_rect.offsetHeight;
    hue_height = elements.hue_bar.offsetHeight;

    // gets active interface and set ups everything
    color = rgbToHsl(parseRGB(elements.color_preview.style.backgroundColor));
    updateComponentsPosition();
    returnPickedColor();
    
    $('li[name="interface_color"]').click(function() {
        const clickedInterface = this; // Convert jQuery object to DOM element
    
        // Get the currently active <li> element
        const activeInterface = document.querySelector('li[name="interface_color"].active');
    
        // Check if the clicked <li> is different from the active one
        if (activeInterface != clickedInterface) {
            // Remove the "active" class from the active <li> and add it to the clicked one
            activeInterface.classList.remove('active');
            clickedInterface.classList.add('active');

            const colorPreview = clickedInterface.querySelector('.color-indicator');
            elements.color_preview = colorPreview;

            const rgb = parseRGB(colorPreview.style.backgroundColor);
            const [h, s, l] = rgbToHsl(rgb);
            color[0] = h; color[1] = s; color[2] = l;

            updateComponentsPosition();
            returnPickedColor();
        }
    });
    
    elements.hue_bar.addEventListener('mousedown', hueBarHandleMouseDown);
    elements.sat_rect.addEventListener('mousedown', satRectHandleMouseDown);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);    
})


$('#modal-colors').on('hidden', function() {
    updateColorConfig();
    const modelView = document.getElementById("model-view");
    modelView.style.backgroundColor = elements.background_color_indicator.style.backgroundColor;

    // Remove all event listeners when the modal is hidden
    elements.hue_bar.removeEventListener('mousedown', hueBarHandleMouseDown);
    elements.sat_rect.removeEventListener('mousedown', satRectHandleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    $('li[name="interface_color"]').off('click');
});