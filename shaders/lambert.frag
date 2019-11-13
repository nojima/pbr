// Lambert の拡散光モデル

const float PI = acos(-1.0);

uniform vec3 albedo;
uniform vec3 lightDirection;
uniform vec3 lightIntensity;

varying vec3 vNormal;

// 正規化Lambertモデル
void main(void) {
    vec3 normal = normalize(vNormal);
    float d = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = d * albedo * lightIntensity / PI;
    gl_FragColor = vec4(diffuse, 1.0);
}
