var gl;
var cube, theta, thetaLoc, colorLoc;

const eye = vec3(0, 0, 2);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const fov = 55;
const near = 0.3;
const far = 5;

var lightPosition = vec4(-1.5, 2.0, 4.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.0, 1.0, 0.0, 1.0);
var materialDiffuse = vec4(0.4, 0.8, 0.4, 1.0);
var materialSpecular = vec4(0.0, 0.4, 0.4, 1.0);
var materialShininess = 300.0;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn’t available");
    }

    cube = createCube(1.0);
    theta = [0.0, 0.0, 0.0];

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    thetaLoc = gl.getUniformLocation(program, "theta");

    var points = [];
    var normals = [];
    points = points.concat(cube.faces_as_triangles(normals));

    var lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));

    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));

    var specularProduct = mult(lightSpecular, materialSpecular);
    var specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));

    var shininessLoc = gl.getUniformLocation(program, "shininess");
    gl.uniform1f(shininessLoc, materialShininess);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    render();
}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta[0] += 0.5;
    theta[1] += 1.0;

    if (theta[1] > 360.0) {
      theta[1] -= 360.0;
    }
    if (theta[0] > 360.0) {
      theta[0] -= 360.0;
    }

    gl.uniform3fv(thetaLoc, flatten(theta));

    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var aspectRatio = gl.canvas.width / gl.canvas.height;
    var projectionMatrix = perspective(55, aspectRatio, 0.3, 5);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.uniform3fv(thetaLoc, flatten(theta));
    gl.drawArrays( gl.TRIANGLES, 0, cube.count_vertices_faces );

    requestAnimFrame( render );
}

function resize(canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
    canvas.height != displayHeight) {

    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}
