// 基本的な World View Projection 変換を行う頂点シェーダ

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
