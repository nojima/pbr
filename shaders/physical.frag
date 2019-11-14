// 物理ベースシェーダ(WIP)

const float PI = acos(-1.0);

uniform vec3 uAlbedo;
uniform float uRoughness;
uniform vec3 uLightDirection;
uniform vec3 uLightIntensity;
uniform vec3 uAmbientIntensity;
uniform float uShininess;
uniform float uReflectance;

varying vec3 vPosition;
varying vec3 vNormal;

vec3 DiffuseBRDF(
    vec3 viewDirection,
    vec3 lightDirection,
    vec3 normal,
    vec3 albedo,
    float roughness
) {
    // Oren-Nayar
    // https://mimosa-pudica.net/improved-oren-nayar.html
    float d = (PI + (PI/2.0 - 2.0/3.0) * roughness);
    float A = 1.0 / d;
    float B = roughness / d;
    float LV = dot(lightDirection, viewDirection);
    float NL = dot(normal, lightDirection);
    float NV = dot(normal, viewDirection);
    float s = LV - NL * NV;
    float t = (s <= 0.0) ? 1.0 : max(NL, NV);
    return albedo * (A + B * s / t);
}

float SpecularBRDF(
    vec3 viewDirection,
    vec3 lightDirection,
    vec3 normal,
    float shininess
) {
    vec3 reflectionVector = -reflect(lightDirection, normal);
    float d = max(dot(reflectionVector, viewDirection), 0.0);
    return pow(d, shininess);
}

void main(void) {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    vec3 lightIrradiance = max(dot(normal, uLightDirection), 0.0) * uLightIntensity;

    //vec3 intensity = uAmbientIntensity;
    //intensity += (1.0 - uReflectance) * uLightIntensity * DiffuseBRDF(viewDirection, uLightDirection, normal, uAlbedo, uRoughness);
    //intensity += uReflectance * uLightIntensity * SpecularBRDF(viewDirection, uLightDirection, normal, uShininess);
    vec3 intensity = DiffuseBRDF(viewDirection, uLightDirection, normal, uAlbedo, uRoughness) * lightIrradiance;

    gl_FragColor = vec4(intensity, 1.0);
}
