"use strict";

async function loadGLTF(path) {
    var loader = new THREE.GLTFLoader();
    return new Promise(resolve => {
        loader.load(path, resolve);
    }, error => {
        console.error(error);
        throw new Error(`Failed to load GLTF: path=${path}`)
    });
}

// アヒルのメッシュを返す
async function loadDuck() {
    const gltf = await loadGLTF("/vendor/gltf-sample-models/2.0/Duck/glTF-Binary/Duck.glb");

    // mesh を取り出す
    var mesh = null;
    for (const obj of gltf.scene.children) {
        for (const child of obj.children) {
            if (child.type === "Mesh") {
                mesh = child;
                break;
            }
        }
    }

    if (!mesh) {
        console.log(gltf);
        throw new Error(`Failed to find mesh`);
    }

    return mesh;
}

async function downloadText(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
        console.log(resp);
        throw new Error(`Failed to download text: url=${url}, status=${resp.status}`);
    }
    return await resp.text();
}

// 単色塗りのマテリアルを返す
async function newPlainShaderMaterial(color) {
    const vertexShader = await downloadText("/shaders/basic.vert");
    const fragmentShader = await downloadText("/shaders/plain.frag");

    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: color },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}

async function downloadTexture(url) {
    return new Promise(resolve => {
        new THREE.TextureLoader().load(url, resolve)
    }, error => {
        console.error(error);
        throw new Error(`Failed to load texture: url=${url}`)
    });
}

// Lambertマテリアルを返す
async function newLambertMaterial(albedo, lightDirection, lightIntensity) {
    const vertexShader = await downloadText("/shaders/basic.vert");
    const fragmentShader = await downloadText("/shaders/lambert.frag");

    return new THREE.ShaderMaterial({
        uniforms: {
            albedo: { value: albedo },
            lightDirection: { value: lightDirection },
            lightIntensity: { value: lightIntensity },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}

// Phongマテリアルを返す
async function newPhongMaterial(
    albedo,
    lightDirection,
    lightIntensity,
    ambientIntensity,
    shininess,
    reflectance,
) {
    const vertexShader = await downloadText("/shaders/basic.vert");
    const fragmentShader = await downloadText("/shaders/phong.frag");

    return new THREE.ShaderMaterial({
        uniforms: {
            uAlbedo: { value: albedo },
            uLightDirection: { value: lightDirection },
            uLightIntensity: { value: lightIntensity },
            uAmbientIntensity: { value: ambientIntensity },
            uShininess: { value: shininess },
            uReflectance: { value: reflectance },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}

// Physicalマテリアルを返す
async function newPhysicalMaterial(parameters) {
    /*
    parameters = {
        albedo,
        albedoMap,
        diffuseRoughness,
        lightDirection,
        lightIntensity,
        ambientIntensity,
        specularRoughness,
        specularColor,
        normalMap,
        normalMapRepeat,
    }
    */

    var vertexShader = await downloadText("/shaders/basic.vert");
    var fragmentShader = await downloadText("/shaders/physical.frag");

    const uniforms = {
        uAlbedo: { value: parameters.albedo },
        uDiffuseRoughness: { value: parameters.diffuseRoughness },
        uLightDirection: { value: parameters.lightDirection },
        uLightIntensity: { value: parameters.lightIntensity },
        uAmbientIntensity: { value: parameters.ambientIntensity },
        uSpecularRoughness: { value: parameters.specularRoughness },
        uSpecularColor: { value: parameters.specularColor },
    };

    if (parameters.albedoMap) {
        uniforms.uAlbedoMap = { value: parameters.albedoMap };
        vertexShader = "#define ALBEDO_MAP_ENABLED 1\n" + vertexShader
        fragmentShader = "#define ALBEDO_MAP_ENABLED 1\n" + fragmentShader
    }

    if (parameters.normalMap) {
        uniforms.uNormalMap = { value: parameters.normalMap };
        uniforms.uNormalMapRepeat = { value: parameters.normalMapRepeat };
        vertexShader = "#define NORMAL_MAP_ENABLED 1\n" + vertexShader
        fragmentShader = "#define NORMAL_MAP_ENABLED 1\n" + fragmentShader
    }

    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}

async function main() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xe0ddcc, 1);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    document.body.appendChild(renderer.domElement);

    // VR
    document.body.appendChild(THREE.WEBVR.createButton(renderer));
    renderer.vr.enabled = true;

    const albedoMap = await downloadTexture("/vendor/gltf-sample-models/2.0/Duck/glTF/DuckCM.png");
    albedoMap.encoding = THREE.sRGBEncoding;
    albedoMap.flipY = false;

    const normalMap = await downloadTexture("/vendor/sample_normal_map.jpg")
    normalMap.encoding = THREE.sRGBEncoding;
    normalMap.flipY = false;

    const mesh = await loadDuck()

    // シェーダを変えてみる
    const shaderType = 2;
    if (shaderType == 0) {
        mesh.material = await newLambertMaterial(
            new THREE.Vector3(0.988, 0.729, 0.012), // albedo
            new THREE.Vector3(-0.2, 1.0, 0.5), // lightDirection
            new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(3.0), // lightIntensity
        );
    } else if (shaderType == 1) {
        mesh.material = await newPhongMaterial(
            new THREE.Vector3(0.988, 0.729, 0.012), // albedo
            new THREE.Vector3(-0.2, 1.0, 0.5), // lightDirection
            new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(2.0), // lightIntensity
            new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(0.3), // ambientIntensity
            40.0, // shiness
            0.2, // reflectance
        );
    } else if (shaderType == 2) {
        const light = {
            lightDirection: new THREE.Vector3(-0.2, 1.0, 0.5),
            lightIntensity: new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(3.0),
            ambientIntensity: new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(0.4),
        };
        const smoothGold = {
            albedo: new THREE.Vector3(0.0, 0.0, 0.0),
            albedoMap: null,
            diffuseRoughness: 0.0,
            specularRoughness: 0.2,
            specularColor: new THREE.Vector3(1.022, 0.782, 0.344),
            normalMap: null,
            normalMapRepeat: 10,
        };
        const roughGold = {
            albedo: new THREE.Vector3(0.0, 0.0, 0.0),
            albedoMap: null,
            diffuseRoughness: 0.0,
            specularRoughness: 0.7,
            specularColor: new THREE.Vector3(1.022, 0.782, 0.344),
            normalMap: null,
            normalMapRepeat: 10,
        };
        const bumpyIron = {
            albedo: new THREE.Vector3(0.0, 0.0, 0.0),
            albedoMap: null,
            diffuseRoughness: 0.0,
            specularRoughness: 0.5,
            specularColor: new THREE.Vector3(0.562, 0.565, 0.578),
            normalMap: normalMap,
            normalMapRepeat: 10,
        };
        const plastic = {
            albedo: new THREE.Vector3(1.0, 1.0, 1.0),
            albedoMap: albedoMap,
            diffuseRoughness: 0.1,
            specularRoughness: 0.2,
            specularColor: new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(0.045),
            normalMap: null,
            normalMapRepeat: 10,
        };
        const roughPlastic = {
            albedo: new THREE.Vector3(1.0, 1.0, 1.0),
            albedoMap: albedoMap,
            diffuseRoughness: 0.9,
            specularRoughness: 0.9,
            specularColor: new THREE.Vector3(1.0, 1.0, 1.0).multiplyScalar(0.045),
            normalMap: null,
            normalMapRepeat: 10,
        };

        const parameters = {
            ...roughPlastic,
            ...light,
        };
        mesh.material = await newPhysicalMaterial(parameters);
    }

    scene.add(mesh);

    mesh.position.z = -400;
    mesh.rotation.x += 0.5;
    mesh.rotation.z += 0.1;

    function render() {
        renderer.render(scene, camera);

        //mesh.rotation.x += 0.01;
        //mesh.rotation.y -= 0.01;
    }
    renderer.setAnimationLoop(render);
}

main();
