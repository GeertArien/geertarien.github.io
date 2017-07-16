var gl;
var cube, theta, thetaLoc, colorLoc;
var projectionMatrixLoc;

const eye = vec3(0, 0, 2);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const fov = 55;
const near = 0.3;
const far = 5;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn’t available");
    }

    cube = createCube(1.0);
    cube.colorFaces = vec4(0.0, 1.0, 0.0, 0.3);
    cube.colorEdges = vec4(0.0, 0.0, 0.0, 1.0);
    theta = [0.0, 0.0, 0.0];

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    colorLoc = gl.getUniformLocation(program, "fColor");
    thetaLoc = gl.getUniformLocation(program, "theta");

    var points = [];
    points = points.concat(cube.faces_as_triangles());
    points = points.concat(cube.edges_as_line_segments());

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

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

    gl.uniform4fv(colorLoc, flatten(cube.colorFaces));
    gl.drawArrays( gl.TRIANGLES, 0, cube.count_vertices_faces );

    gl.uniform4fv(colorLoc, flatten(cube.colorEdges));
    gl.drawArrays( gl.LINES, cube.count_vertices_faces, cube.count_vertices_edges );

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
