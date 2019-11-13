// 基本的な World View Projection 変換を行う頂点シェーダ

varying vec4 vNormal;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    vNormal = modelViewMatrix * vec4(normal, 1.0);
}
