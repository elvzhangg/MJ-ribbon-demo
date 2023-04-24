precision highp float;
precision highp sampler2D;

in vec3 position;
in vec2 uv;
out vec2 vUv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    // vUv = position.xy * .5 + .5;
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}