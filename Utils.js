

class Utils {}

/**
 *
 * @param {HTMLCanvasElement} canvas id
 * @return {WebGLRenderingContext}
 */
Utils.initWebGL = function (canvas) {
    try {
        const gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        return gl;
    } catch (e) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

/**
 *
 * @param {String} vs
 * @param {String} fs
 * @return {WebGLProgram}
 */
Utils.initShaders = function (vs, fs) {

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vs);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
        return null;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fs);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader));
        return null;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (! gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    return shaderProgram;
};

/**
 *
 * @param {Array<String>} textures
 * @return {Promise<WebGLTexture>}
 */
Utils.loadTextures = textures => Promise.all(textures.map(t => Utils.initTexture(t)));

/**
 *
 * @param {String} image
 * @return {Promise<WebGLTexture>}
 */
Utils.initTexture = image => new Promise(resolve => {
    const texture = gl.createTexture();
    texture.image = new Image();
    texture.image.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        resolve(texture);
    });
    texture.image.src = image;
});

window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
        window.setTimeout(callback, 1000/60);
    };

Utils.injectColorPicker = function injectColorPicker(container, hook) {
    const input = document.createElement('input');
    input.type = 'color';
    input.addEventListener('change', e => {
        hook(e.target.value.slice(1).match(/.{2}/g).map(v => +parseInt(v, 16)%256/255))
    });
    container.appendChild(input);
    return input;
}

/**
 *
 * @param {Array} array
 * @return {Array} suffled array
 */
Utils.shuffle = function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

Utils.pair = x => !(x % 2);

Utils.random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// helper to handle shared Lifes between multiple payers
Utils.Lifes = class Lifes {

    constructor(lifes = 3, max = 10) {
        this._lifes = lifes;
        this._max = lifes;
        this.cap = max;
    }

    get max() {
        return this._max;
    }

    get lifes() {
        return this._lifes;
    }

    set lifes(lifes) {
        if (lifes < 0) {
            this._lifes = 0;
        } else {
            this._lifes = lifes > this.cap ? this.cap : lifes;
        }
        if (this._lifes > this._max) {
            this._max = this._lifes;
        }
    }

    get loss() {
        return this._max - this._lifes;
    }

    get left() {
        return this._lifes;
    }

};
