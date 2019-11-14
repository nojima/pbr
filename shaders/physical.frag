// 物理ベースシェーダ(WIP)

const float PI = acos(-1.0);

// 0: Lambert Diffuse BRDF
// 1: Oren-Nayar Diffuse BRDF
// 2: Disney Diffuse BRDF
const int DIFFUSE_BRDF = 2;

uniform vec3 uAlbedo;
uniform float uRoughness;
uniform vec3 uLightDirection;
uniform vec3 uLightIntensity;
uniform vec3 uAmbientIntensity;
uniform float uShininess;
uniform float uReflectance;

varying vec3 vPosition;
varying vec3 vNormal;

// 正規化 Lambert BRDF
vec3 LambertDiffuseBRDF(vec3 albedo) {
    return albedo / PI;
}

// https://mimosa-pudica.net/improved-oren-nayar.html
vec3 OrenNayarDiffuseBRDF(
    vec3 viewDirection,
    vec3 lightDirection,
    vec3 normal,
    vec3 albedo,
    float roughness
) {
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

vec3 DisneyDiffuseBRDF(
    vec3 viewDirection,
    vec3 lightDirection,
    vec3 normal,
    vec3 albedo,
    float roughness
) {
    float LN = dot(lightDirection, normal);
    float VN = dot(viewDirection, normal);
    vec3 halfVector = normalize(lightDirection + viewDirection);
    float HL = dot(halfVector, lightDirection);
    float FD90 = 0.5 + 2.0 * roughness * HL * HL;
    float factor = (1.0 + (FD90 - 1.0) * pow(1.0 - LN, 5.0))
                 * (1.0 + (FD90 - 1.0) * pow(1.0 - VN, 5.0));
    return albedo * factor / PI;
}

vec3 DiffuseBRDF(
    vec3 viewDirection,
    vec3 lightDirection,
    vec3 normal,
    vec3 albedo,
    float roughness
) {
    if (DIFFUSE_BRDF == 0) {
        return LambertDiffuseBRDF(albedo);
    } else if (DIFFUSE_BRDF == 1) {
        return OrenNayarDiffuseBRDF(viewDirection, lightDirection, normal, albedo, roughness);
    } else if (DIFFUSE_BRDF == 2) {
        return DisneyDiffuseBRDF(viewDirection, lightDirection, normal, albedo, roughness);
    } else {
        return vec3(0.0, 0.0, 0.0);
    }
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
