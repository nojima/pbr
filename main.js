"use strict";

function main() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshPhongMaterial({ color: 0xaaaaff });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 2;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
    animate();
}

main();