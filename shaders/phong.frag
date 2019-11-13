// Phong の反射モデル

uniform vec3 albedo;
uniform vec3 lightDirection;
uniform vec3 lightIntensity;
uniform vec3 ambientIntensity;
uniform float shininess;
uniform float reflectance;

varying vec3 vPosition;
varying vec3 vNormal;

vec3 DiffuseIntensity() {
    return (1.0 - reflectance) * dot(lightDirection, vNormal) * albedo * lightIntensity;
}

vec3 SpecularIntensity() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    vec3 reflection = -reflect(lightDirection, vNormal);
    float d = max(dot(reflection, viewDirection), 0.0);
    return reflectance * pow(d, shininess) * lightIntensity;
}

void main(void) {
    vec3 intensity = ambientIntensity + DiffuseIntensity() + SpecularIntensity();
    gl_FragColor = vec4(intensity, 1.0);
}
