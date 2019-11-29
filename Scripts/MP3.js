"use strict";
var gl;
//This is the shader for the teapot
var shaderProgramReflective;
var shaderProgramRefractive;
var shaderProgramCube;

// Create a place to store teapot geometry
var vertexPositionBufferReflective;
var vertexColorBuffer;
//Create a place to store normals for shading
var vertexNormalBufferReflective;
var vertexPositionCube;
var vertexNormalCube;

// Create a place to store teapot geometry
var vertexPositionBufferRefractive;
//Create a place to store normals for shading
var vertexNormalBufferRefractive;

//Our matrices for pipeline
var projectionMatrix;
var viewMatrix;
var worldMatrix;

//Info for reading in the obj file
var verts=[];
var norms=[];
var numT;
var cube = [];
var cubeNorms =[];

//Info for the cube map
var texture;

//The angles for orbiting and rotating the pot
var angle = 0;
var pot_angle = 0;
var radius = 0;

//Random options
var fieldOfViewRadians;
var cameraYRotationRadians;

/**
 * Start point is here so we make sure we load
 * the file before continuing
 */
function start() {
    readTextFile("../Resources/teapot.obj", parseMesh);
}

/**
 * Handles input for rotation and orbiting
 *
 * @param event
 */
function keyHandler(event) {
    console.log(event.keyCode);

    if (event.keyCode == 65) {
        angle += 0.5;
    } else if (event.keyCode == 68) {
        angle -= 0.5;
    } else if (event.keyCode == 87) {
        pot_angle += 0.5;
    } else if (event.keyCode == 83) {
        pot_angle -= 0.5;
    } else if (event.keyCode == 76) {
        radius += 0.2;
    } else if (event.keyCode == 74) {
        radius -= 0.2;
    }
}

/**
 * Sets up all shaders and begins animation frame
 */
function startup() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    setupSkybox();
    setupPot();

    fieldOfViewRadians = degToRad(60);
    cameraYRotationRadians = degToRad(0);
    worldMatrix = m4.yRotation(0);
    angle = 0;
    radius = 2;

    requestAnimationFrame(drawScene);
}

/**
 * Self explanitory
 * @param d
 * @returns {number}
 */
function degToRad(d) {
    return d * Math.PI / 180;
}

// Draw the scene.
function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // camera going in circle 2 units from origin looking at origin
    var cameraPosition = [Math.cos(angle * .1) * radius, 0, Math.sin(angle * .1) * radius];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    // Compute the camera's matrix using look at.
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    viewMatrix = m4.inverse(cameraMatrix);

    // Rotate the cube around the x axis
    worldMatrix = m4.yRotation(pot_angle * .1);//time * 0.11);

    gl.uniform1i(shaderProgramCube.textureUniform, 0);
    var radio = document.getElementById("radio").checked;

    if (radio == 1) {
        gl.uniform1i(shaderProgramReflective.textureUniform, 0);
        gl.uniform3fv(shaderProgramReflective.worldCameraUniform, cameraPosition);
    } else {
        gl.uniform1i(shaderProgramRefractive.textureUniform, 0);
        gl.uniform3fv(shaderProgramRefractive.worldCameraUniform, cameraPosition);
    }

    drawCube();
    drawPot(radio);

    requestAnimationFrame(drawScene);
}

/**
 * Use the shader for the pot to draw the pot
 */
function drawPot(radio) {

    if (radio == 1) {

        gl.useProgram(shaderProgramReflective);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferReflective);
        gl.vertexAttribPointer(shaderProgramReflective.vertexPositionAttribute,
            vertexPositionBufferReflective.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferReflective);
        gl.vertexAttribPointer(shaderProgramReflective.vertexNormalAttribute,
            vertexNormalBufferReflective.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.vertexAttribPointer(shaderProgramReflective.vertexColorAttribute,
            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(shaderProgramReflective.mvMatrixUniform, false, viewMatrix);
        gl.uniformMatrix4fv(shaderProgramReflective.pMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderProgramReflective.wMatrixUniform, false, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBufferReflective.numberOfItems);
    } else {
        gl.useProgram(shaderProgramRefractive);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferReflective);
        gl.vertexAttribPointer(shaderProgramRefractive.vertexPositionAttribute,
            vertexPositionBufferReflective.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferReflective);
        gl.vertexAttribPointer(shaderProgramRefractive.vertexNormalAttribute,
            vertexNormalBufferReflective.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.vertexAttribPointer(shaderProgramRefractive.vertexColorAttribute,
            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(shaderProgramRefractive.mvMatrixUniform, false, viewMatrix);
        gl.uniformMatrix4fv(shaderProgramRefractive.pMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderProgramRefractive.wMatrixUniform, false, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBufferReflective.numberOfItems);
    }
}

/**
 * Use the shader for the cubemap to draw the cubemap;
 */
function drawCube() {
    // We only care about direction so remove the translation
    var viewDirectionMatrix = m4.copy(viewMatrix);
    viewDirectionMatrix[12] = 0;
    viewDirectionMatrix[13] = 0;
    viewDirectionMatrix[14] = 0;

    var viewDirectionProjectionMatrix = m4.multiply(
        projectionMatrix, viewDirectionMatrix);
    var viewDirectionProjectionInverseMatrix =
        m4.inverse(viewDirectionProjectionMatrix);

    gl.useProgram(shaderProgramCube);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionCube);
    gl.vertexAttribPointer(shaderProgramCube.vertexPositionAttribute,
        vertexPositionCube.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalCube);
    gl.vertexAttribPointer(shaderProgramCube.vertexNormalAttribute,
        vertexNormalCube.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(shaderProgramCube.mvMatrixUniform, false, viewMatrix);
    gl.uniformMatrix4fv(shaderProgramCube.pMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderProgramCube.viewDirProjUniform, false, viewDirectionProjectionInverseMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, vertexPositionCube.numberOfItems);
}

//------------------------------Handles all of the shader info for the cube-------

/**
 * Handles the skybox shaders
 */
function setupSkybox() {
    setupCubeShader();
    loadCubeVertices();

    // Create a texture.
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            //url: 'computer-history-museum/pos-x.jpg',
            url: '../Resources/Ryfjallet/posx.jpg'
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: '../Resources/Ryfjallet/negx.jpg'
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: '../Resources/Ryfjallet/posy.jpg'
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: '../Resources/Ryfjallet/negy.jpg'
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: '../Resources/Ryfjallet/posz.jpg'
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: '../Resources/Ryfjallet/negz.jpg'
        },
    ];
    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;

    // Upload the canvas to the cubemap face.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 2048;
    const height = 2048;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // setup each face so it's immediately renderable
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

    // Asynchronously load an image
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, level, internalFormat, format, type, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
});
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAX_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

}

/**
 * Sets up shader for the cube
 *
 */
function setupCubeShader() {
    var vertexShader = loadShaderFromDOM("skybox-shader-vs");
    var fragmentShader = loadShaderFromDOM("skybox-shader-fs");

    shaderProgramCube = gl.createProgram();
    gl.attachShader(shaderProgramCube, vertexShader);
    gl.attachShader(shaderProgramCube, fragmentShader);
    gl.linkProgram(shaderProgramCube);

    if (!gl.getProgramParameter(shaderProgramCube, gl.LINK_STATUS)) {
        alert("Failed to setup shaders");
    }

    gl.useProgram(shaderProgramCube);
    shaderProgramCube.vertexPositionAttribute = gl.getAttribLocation(shaderProgramCube, "a_position");
    gl.enableVertexAttribArray(shaderProgramCube.vertexPositionAttribute);
    shaderProgramCube.vertexNormalAttribute = gl.getAttribLocation(shaderProgramCube, "a_normal");
    gl.enableVertexAttribArray(shaderProgramCube.vertexNormalAttribute);

    shaderProgramCube.mvMatrixUniform = gl.getUniformLocation(shaderProgramCube, "uMVMatrix");
    shaderProgramCube.pMatrixUniform = gl.getUniformLocation(shaderProgramCube, "uPMatrix");

    shaderProgramCube.viewDirProjUniform = gl.getUniformLocation(shaderProgramCube, "u_viewDirectionProjectionInverse");
    shaderProgramCube.textureUniform = gl.getUniformLocation(shaderProgramCube, "u_skybox");
}

/**
 * Populate vertex buffer with data
 */
function loadCubeVertices() {
    var nT = cubeBuilder(2, cube);

    gl.useProgram(shaderProgramCube);
    vertexPositionCube = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionCube);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.DYNAMIC_DRAW);
    vertexPositionCube.itemSize = 3;
    vertexPositionCube.numberOfItems = nT * 3;

    vertexNormalCube = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalCube);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNorms), gl.DYNAMIC_DRAW);
    vertexNormalCube.itemSize = 3;
    vertexNormalCube.numberOfItems = nT * 3;
}

function cubeBuilder(length, vertexArray)
{
    var a = vec4.fromValues(length, length, length,0);
    var b = vec4.fromValues(length, -length, length,0);
    var c = vec4.fromValues(-length,-length, length,0);
    var d = vec4.fromValues(-length, length, length,0);
    var e = vec4.fromValues(length, length, -length,0);
    var f = vec4.fromValues(length, -length,-length,0);
    var g = vec4.fromValues(-length,-length,-length,0);
    var h = vec4.fromValues(-length, length,-length,0);

    pushTriangle(a, b, c, vertexArray);
    pushTriangle(a, c, d, vertexArray);

    pushTriangle(e, g, f, vertexArray);
    pushTriangle(e, h, g, vertexArray);

    pushTriangle(b, f, g, vertexArray);
    pushTriangle(b, g, c, vertexArray);

    pushTriangle(d, h, e, vertexArray);
    pushTriangle(d, e, a, vertexArray);

    pushTriangle(a, e, f, vertexArray);
    pushTriangle(a, f, b, vertexArray);

    pushTriangle(c, g, h, vertexArray);
    pushTriangle(c, h, d, vertexArray);

    calculateNormals(vertexArray, cubeNorms);

    for (var i = 0; i < cubeNorms.length; i++) {
        //console.log(cubeNorms[i]);
        cubeNorms[i] = -cubeNorms[i];
    }

    return 12;
}
//------------------------STUFF TO SETUP AND MAINTAIN THE TEAPOT SHADER---------------

/**
 * Sets up pot shaders, note that load colors is obsolete
 */
function setupPot() {
    setupShaders();
    loadVertices();
    loadColors();
}


/**
 * Populate vertex buffer with data
 */
function loadVertices() {

    gl.useProgram(shaderProgramReflective);
    vertexPositionBufferReflective = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferReflective);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
    vertexPositionBufferReflective.itemSize = 3;
    vertexPositionBufferReflective.numberOfItems = numT * 3;

    vertexNormalBufferReflective = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferReflective);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norms), gl.DYNAMIC_DRAW);
    vertexNormalBufferReflective.itemSize = 3;
    vertexNormalBufferReflective.numberOfItems = numT * 3;

    gl.useProgram(shaderProgramRefractive);
    vertexPositionBufferRefractive = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferRefractive);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
    vertexPositionBufferRefractive.itemSize = 3;
    vertexPositionBufferRefractive.numberOfItems = numT * 3;

    vertexNormalBufferRefractive = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferRefractive);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norms), gl.DYNAMIC_DRAW);
    vertexNormalBufferRefractive.itemSize = 3;
    vertexNormalBufferRefractive.numberOfItems = numT * 3;
}

/**
 * Populate color buffer with data (OBSOLETE AND UNNECESSARY)
 @param {number} number of vertices to use around the circle boundary
 */
function loadColors() {
    gl.useProgram(shaderProgramReflective);
    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

    var colors = [];

    for (var i = 0; i < (new Float32Array(verts)).length; i++) {
        colors.push(1.0,0.0,0.0,1.0);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    vertexColorBuffer.itemSize = 4;
    vertexColorBuffer.numItems = numT * 4;
}

/**
 * Sets up shaders
 *
 */
function setupShaders() {
    var vertexShader = loadShaderFromDOM("reflective-shader-vs");
    var fragmentShader = loadShaderFromDOM("reflective-shader-fs");

    shaderProgramReflective = gl.createProgram();
    gl.attachShader(shaderProgramReflective, vertexShader);
    gl.attachShader(shaderProgramReflective, fragmentShader);
    gl.linkProgram(shaderProgramReflective);

    if (!gl.getProgramParameter(shaderProgramReflective, gl.LINK_STATUS)) {
        alert("Failed to setup shaders");
    }

    gl.useProgram(shaderProgramReflective);
    shaderProgramReflective.vertexPositionAttribute = gl.getAttribLocation(shaderProgramReflective, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgramReflective.vertexPositionAttribute);
    shaderProgramReflective.vertexNormalAttribute = gl.getAttribLocation(shaderProgramReflective, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgramReflective.vertexNormalAttribute);
    shaderProgramReflective.vertexColorAttribute = gl.getAttribLocation(shaderProgramReflective, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgramReflective.vertexColorAttribute);

    shaderProgramReflective.mvMatrixUniform = gl.getUniformLocation(shaderProgramReflective, "uMVMatrix");
    shaderProgramReflective.pMatrixUniform = gl.getUniformLocation(shaderProgramReflective, "uPMatrix");
    shaderProgramReflective.wMatrixUniform = gl.getUniformLocation(shaderProgramReflective, "uWorldMatrix");

    shaderProgramReflective.textureUniform = gl.getUniformLocation(shaderProgramReflective, "u_texture");
    shaderProgramReflective.worldCameraUniform = gl.getUniformLocation(shaderProgramReflective, "u_worldCameraPosition")

    vertexShader = loadShaderFromDOM("refractive-shader-vs");
    fragmentShader = loadShaderFromDOM("refractive-shader-fs");

    shaderProgramRefractive = gl.createProgram();
    gl.attachShader(shaderProgramRefractive, vertexShader);
    gl.attachShader(shaderProgramRefractive, fragmentShader);
    gl.linkProgram(shaderProgramRefractive);

    if (!gl.getProgramParameter(shaderProgramRefractive, gl.LINK_STATUS)) {
        alert("Failed to setup shaders");
    }

    gl.useProgram(shaderProgramRefractive);
    shaderProgramRefractive.vertexPositionAttribute = gl.getAttribLocation(shaderProgramRefractive, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgramRefractive.vertexPositionAttribute);
    shaderProgramRefractive.vertexNormalAttribute = gl.getAttribLocation(shaderProgramRefractive, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgramRefractive.vertexNormalAttribute);
    shaderProgramRefractive.vertexColorAttribute = gl.getAttribLocation(shaderProgramRefractive, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgramRefractive.vertexColorAttribute);

    shaderProgramRefractive.mvMatrixUniform = gl.getUniformLocation(shaderProgramRefractive, "uMVMatrix");
    shaderProgramRefractive.pMatrixUniform = gl.getUniformLocation(shaderProgramRefractive, "uPMatrix");
    shaderProgramRefractive.wMatrixUniform = gl.getUniformLocation(shaderProgramRefractive, "uWorldMatrix");

    shaderProgramRefractive.textureUniform = gl.getUniformLocation(shaderProgramRefractive, "u_texture");
    shaderProgramRefractive.worldCameraUniform = gl.getUniformLocation(shaderProgramRefractive, "u_worldCameraPosition")
}

function loadShaderFromDOM(id) {
    var shaderScript = document.getElementById(id);

    // If we don't find an element with the specified id
    // we do an early exit
    if (!shaderScript) {
        return null;
    }

    // Loop through the children for the found DOM element and
    // build up the shader source code as a string
    var shaderSource = "";
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
        if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
            shaderSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}
//------------------------STUFF FOR DOWNLOADING OBJ FILES-----------------------------
/**
 * populates verts and norms for pot buffers
 * @param vertices
 * @param faces
 */
function setBuffs(vertices, faces) {
    //console.log("vert count", vertices.length / 3);
    //console.log("face count", faces.length / 3);

    var scale = .25;

    for (var i = 0; i < faces.length; i+=3) {

        //console.log(faces[i] - 1)

        verts.push(scale * vertices[3 * (faces[i])]);
        verts.push(scale * vertices[3 * (faces[i]) + 1] - .15);
        verts.push(scale * vertices[3 * (faces[i]) + 2]);
        verts.push(scale * vertices[3 * (faces[i + 1])]);
        verts.push(scale * vertices[3 * (faces[i + 1]) + 1] - .15);
        verts.push(scale * vertices[3 * (faces[i + 1]) + 2]);
        verts.push(scale * vertices[3 * (faces[i + 2])]);
        verts.push(scale * vertices[3 * (faces[i + 2]) + 1] - .15);
        verts.push(scale * vertices[3 * (faces[i + 2]) + 2]);

    }

    calculateNormals(verts, norms);
}

/**
 * parses the obj and makes an array of verts and faces
 * @param file
 */
function parseMesh(file) {
    var vertices = [];
    var faces = [];

    //console.log(file[0]);

    var lines = file.split("\n");

    numT = 0;

    for (var i = 0; i < lines.length; i++) {
        var data = lines[i].split(" ");


        if (data[0] == 'v') {
            //console.log("Pushing (", parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]), ")");
            vertices.push(parseFloat(data[1]));
            vertices.push(parseFloat(data[2]));
            vertices.push(parseFloat(data[3]));
        }

        if (data[0] == 'f') {
            //console.log("Pushing (", parseInt(data[2]) - 1, parseInt(data[3]) - 1, parseInt(data[4]) - 1, ")");
            faces.push(parseInt(data[2]) - 1);
            faces.push(parseInt(data[3]) - 1);
            faces.push(parseInt(data[4]) - 1);
            numT += 1;
        }
    }

    setBuffs(vertices, faces);

    startup();
}

/**
 * Gets a file from the server for processing on the client side.
 *
 * @param  file A string that is the name of the file to get
 * @param  callbackFunction The name of function (NOT a string) that will receive a string holding the file
 *         contents.
 *
 */
function readTextFile(file, callbackFunction) {
    console.log("reading "+ file);
    var rawFile = new XMLHttpRequest();
    var allText = [];
    rawFile.open("GET", file, true);

    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                callbackFunction(rawFile.responseText);
                console.log("Got text file!");

            }
        }
    }
    rawFile.send(null);
}

/**
 * Calculates all the per vertex normals
 * @param {vertexArray} vertexArray to be populated
 * @param {normalArray} normalArray to be populated
 */
function calculateNormals(vertexArray, normalArray) {
    var len = vertexArray.length;
    //console.log(len, "=", vertexArray.length);

    //for each point
    for (var aa = 0; aa < len; aa+=3) {
        var avgX = 0;
        var avgY = 0;
        var avgZ = 0;

        var adjacent_faces = [];
        //for each triangle
        for (var bb = 0; bb < len; bb += 9) {
            //if it is in the triangle

            var isA = (vertexArray[aa] == vertexArray[bb] && vertexArray[aa + 1] == vertexArray[bb + 1]
                && vertexArray[aa + 2] == vertexArray[bb + 2]);
            var isB = (vertexArray[aa] == vertexArray[bb + 3] && vertexArray[aa + 1] == vertexArray[bb + 4]
                && vertexArray[aa + 2] == vertexArray[bb + 5]);
            var isC = (vertexArray[aa] == vertexArray[bb + 6] && vertexArray[aa + 1] == vertexArray[bb + 7]
                && vertexArray[aa + 2] == vertexArray[bb + 8]);

            if (isA || isB || isC) {
                //console.log("OK");
                var t1 = vec4.fromValues(vertexArray[bb], vertexArray[bb + 1], vertexArray[bb + 2]);
                var t2 = vec4.fromValues(vertexArray[bb + 3], vertexArray[bb + 4], vertexArray[bb + 5]);
                var t3 = vec4.fromValues(vertexArray[bb + 6], vertexArray[bb + 7], vertexArray[bb + 8]);

                pushVertex(t1, adjacent_faces);
                pushVertex(t2, adjacent_faces);
                pushVertex(t3, adjacent_faces);
            }
        }

        var len_adj = adjacent_faces.length;
        //console.log(len_adj / 9);


        //for each adjacent face
        for (var cc = 0; cc < len_adj; cc += 9) {
            //calculate normal
            var t1 = vec3.fromValues(adjacent_faces[cc], adjacent_faces[cc + 1], adjacent_faces[cc + 2]);
            var t2 = vec3.fromValues(adjacent_faces[cc + 3], adjacent_faces[cc + 4], adjacent_faces[cc + 5]);
            var t3 = vec3.fromValues(adjacent_faces[cc + 6], adjacent_faces[cc + 7], adjacent_faces[cc + 8]);

            //console.log(t1[0] - t3[0]);

            var p1 = vec3.fromValues(t1[0] - t3[0], t1[1] - t3[1], t1[2] - t3[2]);
            var p2 = vec3.fromValues(t2[0] - t1[0], t2[1] - t1[1], t2[2] - t1[2]);

            //var normal = vec3.cross(t2, t1);

            var normal = vec4.fromValues(p1[1] * p2[2] - p2[1] * p1[2], p1[2] * p2[0] - p1[0] * p2[2], p1[0] * p2[1] - p1[1] * p2[0]);

            vec3.normalize(normal, normal);

            //if (normal[0] != 0) console.log(normal[0], " ", normal[1], " ", normal[2]);

            //add normal to the average
            avgX += normal[0];
            avgY += normal[1];
            avgZ += normal[2];
        }

        //set the average as the normal for the vertex
        avgX /= (len_adj / 9.0);
        avgY /= (len_adj / 9.0);
        avgZ /= (len_adj / 9.0);

        var avg = vec4.fromValues(avgX, avgY, avgZ);

        //vec4.normalize(avg, avg);

        //console.log(avg[0], " ", avg[1], " ", avg[2]);

        normalArray[aa] = avg[0];
        normalArray[aa + 1] = avg[1];
        normalArray[aa + 2] = avg[2];
    }
}

function pushVertex(v, vArray)
{
    for(var i=0;i<3;i++)
    {
        vArray.push(v[i]);
    }
}

/**
 * Pushes vertex onto a vertex array
 */
function pushTriangle(a,b,c, vArray)
{
    pushVertex(a,vArray);
    pushVertex(b,vArray);
    pushVertex(c,vArray);
}