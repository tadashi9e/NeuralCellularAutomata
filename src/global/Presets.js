let presets = [];
presets.push({ 
    name: "Slime mold", 
    activationFunctionBody: "return -1/(0.89*Math.pow(x, 2)+1)+1;",
    kernel: [[0.8,    -0.85,      0.8],
             [-0.85,    -0.2,     -0.85],
             [0.8,     -0.85,     0.8]]
});
presets.push({ 
    name: "Flames", 
    activationFunctionBody: "return -1/Math.pow(2, (Math.pow(x, 2)))+1",
    kernel: [[1,       -0.45,      1],
             [-0.8,    -0.55,     -0.65],
             [0.5,     -0.85,      0.2]]
});
presets.push({ 
    name: "Conway's GOL", 
    activationFunctionBody:
    "return ((x >= 2.5 && x < 3.5) || (x >= 10.5 && x < 12.5)) ? 1 : 0;",
    kernel: [[1,          1,          1],
             [1,          9,          1],
             [1,          1,          1]]
});
presets.push({ 
    name: "Lava lamp", 
    activationFunctionBody: "return -1/(0.89*Math.pow(x, 2)+1)+1;",
    kernel: [[-0.31,  0.75,  -0.31],
             [0.75,   0.56,  0.75],
             [-0.31, 0.15, -0.31]]
});

function createPresetButtons() {
    let htmlButton;
    for (let i=presets.length-1; i>=0; i--) {
        htmlButton = '<input type="button" value="'+ presets[i].name +'" onClick="loadPreset('+ i +')">';
        document.getElementById("presetsTitle").insertAdjacentHTML('afterend', htmlButton);
    }
}

function loadPreset(index) {
    let preset = presets[index];
    activationFunctionBody = preset.activationFunctionBody;
    kernel = preset.kernel;
    updateInputFieldsValues();
    updateConfiguration();
}

createPresetButtons();
