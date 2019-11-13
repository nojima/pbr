"use strict";

async function loadGLTF(path) {
    var loader = new THREE.GLTFLoader();
    return new Promise(resolve => {
        loader.load(path, resolve)
    }, error => {
        console.error(error);
        throw new Error(`Failed to load GLTF: path=${path}`)
    });
}

async function downloadText(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
        console.log(resp);
        throw new Error(`Failed to download text: url=${url}, status=${resp.status}`);
    }
    return await resp.text();
}

async function main() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var ambientLight = new THREE.AmbientLight(0x404040, 1.25);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    scene.add(directionalLight);

    var gltf = await loadGLTF("/vendor/gltf-sample-models/2.0/Duck/glTF-Binary/Duck.glb")

    // mesh を取り出す
    var mesh = null
    for (const obj of gltf.scene.children) {
        for (const child of obj.children) {
            if (child.type === "Mesh") {
                mesh = child
                break
            }
        }
    }
    console.log(mesh);

    // シェーダを変えてみる
    var vertexShader = await downloadText("/shaders/basic.vert");
    var fragmentShader = await downloadText("/shaders/plain.frag");

    var material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
    mesh.material = material;

    scene.add(mesh);

    camera.position.z = 400;
    camera.position.x = 0;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);

        mesh.rotation.x += 0.01;
        mesh.rotation.y -= 0.01;
    }
    animate();
}

main();