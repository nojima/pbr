// 基本的な World View Projection 変換を行う頂点シェーダ

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = (modelMatrix * vec4(normal, 1.0)).xyz;
    vUV = uv;
}
