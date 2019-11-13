// Phong の反射モデル

const float PI = acos(-1.0);

uniform vec3 uAlbedo;
uniform vec3 uLightDirection;
uniform vec3 uLightIntensity;
uniform vec3 uAmbientIntensity;
uniform float uShininess;
uniform float uReflectance;

varying vec3 vPosition;
varying vec3 vNormal;

vec3 DiffuseIntensity(
    vec3 lightDirection,
    vec3 lightIntensity,
    vec3 normal,
    vec3 albedo,
    float reflectance
) {
    // 正規化Lambertモデル
    float d = max(dot(lightDirection, normal), 0.0);
    return (1.0 - reflectance) * d * albedo * lightIntensity / PI;
}

vec3 SpecularIntensity(
    vec3 position,
    vec3 lightDirection,
    vec3 lightIntensity,
    vec3 normal,
    float reflectance,
    float shininess
) {
    vec3 viewDirection = normalize(cameraPosition - position);
    vec3 reflectionVector = -reflect(lightDirection, normal);
    float d = max(dot(reflectionVector, viewDirection), 0.0);
    return reflectance * pow(d, shininess) * lightIntensity;
}

void main(void) {
    vec3 normal = normalize(vNormal);
    vec3 intensity = uAmbientIntensity;
    intensity += DiffuseIntensity(uLightDirection, uLightIntensity, normal, uAlbedo, uReflectance);
    intensity += SpecularIntensity(vPosition, uLightDirection, uLightIntensity, normal, uReflectance, uShininess);
    gl_FragColor = vec4(intensity, 1.0);
}
