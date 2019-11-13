// Lambert の拡散光モデル

uniform vec3 albedo;
uniform vec3 lightDirection;
uniform vec3 lightIntensity;
varying vec4 vNormal;

void main(void) {
    vec3 normal = vNormal.xyz;
    vec3 diffuse = dot(lightDirection, normal) * albedo * lightIntensity;
    gl_FragColor = vec4(diffuse, 1.0);
}
