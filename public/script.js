// Get the canvas and WebGL context
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL not supported");
}

// Vertex shader program
const vertexShaderSource = `
attribute vec4 a_position;
attribute vec4 a_color;
uniform mat4 u_matrix;
varying vec4 v_color;
void main(void) {
  gl_Position = u_matrix * a_position;
  v_color = a_color;
}
`;

// Fragment shader program
const fragmentShaderSource = `
precision mediump float;
varying vec4 v_color;
void main(void) {
  gl_FragColor = v_color;
}
`;

// Helper to compile a shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Helper to create a program
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program linking failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

// Compile shaders and create program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Cube vertices (positions)
const positions = [
  // Front face
  -1, -1,  1,
   1, -1,  1,
   1,  1,  1,
  -1,  1,  1,
  // Back face
  -1, -1, -1,
  -1,  1, -1,
   1,  1, -1,
   1, -1, -1,
];

// Cube colors (per vertex)
const colors = [
  1, 0, 0, 1, // red
  0, 1, 0, 1, // green
  0, 0, 1, 1, // blue
  1, 1, 0, 1, // yellow
  1, 0, 1, 1, // magenta
  0, 1, 1, 1, // cyan
  1, 0.5, 0, 1, // orange
  0.5, 0, 0.5, 1, // purple
];

// Indices for cube faces
const indices = [
  0, 1, 2, 0, 2, 3,    // front
  4, 5, 6, 4, 6, 7,    // back
  4, 5, 3, 4, 3, 0,    // left
  1, 7, 6, 1, 6, 2,    // right
  3, 2, 6, 3, 6, 5,    // top
  4, 0, 1, 4, 1, 7     // bottom
];

// Create buffers
function createBuffer(type, data, usage) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, usage);
  return buffer;
}

const positionBuffer = createBuffer(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
const colorBuffer = createBuffer(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
const indexBuffer = createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// Get attribute/uniform locations
const a_position = gl.getAttribLocation(program, "a_position");
const a_color = gl.getAttribLocation(program, "a_color");
const u_matrix = gl.getUniformLocation(program, "u_matrix");

// Enable attribute helper
function enableAttribute(buffer, attribute, size, type) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(attribute, size, type, false, 0, 0);
  gl.enableVertexAttribArray(attribute);
}

// Rotation angle
let angle = 0;

// Draw the scene
function drawScene() {
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI / 4, aspect, 0.1, 100);

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, angle, [0, 1, 0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, angle * 0.7, [1, 0, 0]);

  const finalMatrix = mat4.create();
  mat4.multiply(finalMatrix, projectionMatrix, modelViewMatrix);

  gl.useProgram(program);

  enableAttribute(positionBuffer, a_position, 3, gl.FLOAT);
  enableAttribute(colorBuffer, a_color, 4, gl.FLOAT);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.uniformMatrix4fv(u_matrix, false, finalMatrix);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  angle += 0.01;
  requestAnimationFrame(drawScene);
}

drawScene();
