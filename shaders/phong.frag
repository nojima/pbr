// Phong の反射モデル

uniform vec3 uAlbedo;
uniform vec3 uLightDirection;
uniform vec3 uLightIntensity;
uniform vec3 uAmbientIntensity;
uniform float uShininess;
uniform float uReflectance;

varying vec3 vPosition;
varying vec3 vNormal;

vec3 DiffuseIntensity() {
    return (1.0 - uReflectance) * dot(uLightDirection, vNormal) * uAlbedo * uLightIntensity;
}

vec3 SpecularIntensity() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    vec3 reflection = -reflect(uLightDirection, vNormal);
    float d = max(dot(reflection, viewDirection), 0.0);
    return uReflectance * pow(d, uShininess) * uLightIntensity;
}

void main(void) {
    vec3 intensity = uAmbientIntensity + DiffuseIntensity() + SpecularIntensity();
    gl_FragColor = vec4(intensity, 1.0);
}
