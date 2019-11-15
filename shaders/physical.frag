// 物理ベースシェーダ(WIP)

const float PI = acos(-1.0);

// 0: Lambert Diffuse BRDF
// 1: Oren-Nayar Diffuse BRDF
// 2: Disney Diffuse BRDF
const int DIFFUSE_BRDF = 2;

uniform vec3 uAlbedo;
#ifdef ALBEDO_MAP_ENABLED
    uniform sampler2D uAlbedoMap;
#endif
uniform float uDiffuseRoughness;
uniform vec3 uLightDirection;
uniform vec3 uLightIntensity;
uniform vec3 uAmbientIntensity;
uniform float uSpecularRoughness;
uniform vec3 uSpecularColor;
#ifdef NORMAL_MAP_ENABLED
    uniform sampler2D uNormalMap;
    uniform float uNormalMapRepeat;
#endif

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

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
    vec2 uv,
    float roughness
) {
    #ifdef ALBEDO_MAP_ENABLED
        vec3 albedo_ = albedo * texture2D(uAlbedoMap, uv).rgb;
    #else
        vec3 albedo_ = albedo;
    #endif

    if (DIFFUSE_BRDF == 0) {
        return LambertDiffuseBRDF(albedo_);
    } else if (DIFFUSE_BRDF == 1) {
        return OrenNayarDiffuseBRDF(viewDirection, lightDirection, normal, albedo_, roughness);
    } else if (DIFFUSE_BRDF == 2) {
        return DisneyDiffuseBRDF(viewDirection, lightDirection, normal, albedo_, roughness);
    } else {
        return vec3(0.0, 0.0, 0.0);
    }
}

// Trowbride-Reitz
float GGX(vec3 halfVector, vec3 normal, float roughness) {
    float alpha2 = pow(roughness, 4.0);
    float NH = dot(normal, halfVector);
    float d = NH * NH * (alpha2 - 1.0) + 1.0;
    return alpha2 / (PI * d * d);
}

// Smith Joint Masking and Shadowing Function
float MaskingAndShadowing(vec3 normal, vec3 lightDirection, vec3 viewDirection, float roughness) {
    float alpha2 = pow(roughness, 4.0);
    float NL = dot(normal, lightDirection);
    float NV = dot(normal, viewDirection);
    float lambdaL = NV * sqrt(NL * NL * (1.0 - alpha2) + alpha2);
    float lambdaV = NL * sqrt(NV * NV * (1.0 - alpha2) + alpha2);
    return 0.5 / (lambdaL + lambdaV);
}

// Schlick の Fresnel の近似式
vec3 Fresnel(vec3 normal, vec3 lightDirection, vec3 specularColor) {
    float NL = dot(lightDirection, normal);
    return specularColor + (1.0 - specularColor) * pow(1.0 - NL, 5.0);
}

// Cook-Torrance
vec3 SpecularBRDF(
    vec3 viewDirection,
    vec3 lightDirection,
    vec3 normal,
    float roughness,
    vec3 specularColor
) {
    vec3 halfVector = normalize(lightDirection + viewDirection);
    return GGX(halfVector, normal, roughness)
         * MaskingAndShadowing(normal, lightDirection, viewDirection, roughness)
         * Fresnel(halfVector, lightDirection, specularColor);
}

// r を n の周りに theta だけ回転させたベクトルを返す
vec3 RotateVector(vec3 r, vec3 n, float theta) {
    // ロドリゲスの回転公式
    return r * cos(theta) + n * dot(r, n) * (1.0 - cos(theta)) + cross(n, r) * sin(theta);
}

vec3 CalculateNormal() {
    #ifdef NORMAL_MAP_ENABLED
        vec3 m = 2.0 * texture2D(uNormalMap, fract(vUV * uNormalMapRepeat)).rgb - 1.0;
        vec3 axis = normalize(vec3(m.y, -m.x, 0));
        float angle = acos(m.z);
        return normalize(RotateVector(vNormal, axis, angle));
    #else
        return normalize(vNormal);
    #endif
}

void main(void) {
    vec3 normal = CalculateNormal();
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    vec3 lightIrradiance = max(dot(normal, uLightDirection), 0.0) * uLightIntensity;

    vec3 fr = vec3(0.0, 0.0, 0.0);

    // diffuse
    fr += DiffuseBRDF(viewDirection, uLightDirection, normal, uAlbedo, vUV, uDiffuseRoughness);

    // specular
    fr += SpecularBRDF(viewDirection, uLightDirection, normal, uSpecularRoughness, uSpecularColor);

    vec3 intensity = fr * lightIrradiance + uAmbientIntensity;
    gl_FragColor = vec4(intensity, 1.0);
}
