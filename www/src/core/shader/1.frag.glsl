precision highp float;
precision highp sampler2D;

uniform sampler2D combinedTexture;
uniform vec2 resolution;
uniform float time;
uniform float hoverIntensity;
in vec2 vUv;
out vec4 fragColor;

void main() {

    vec4 color = texture(combinedTexture, vUv);

    fragColor = color;
}
