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