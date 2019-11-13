// 単色で塗るだけのフラグメントシェーダ

void main(void) {
    vec3 rgb = vec3(252.0, 186.0, 3.0);
    gl_FragColor = vec4(rgb / 256.0, 1.0);
}
