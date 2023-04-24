import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import TWEEN from 'three/addons/libs/tween.module.js';

import { Control } from './control';
import { TrailPass } from './TrailPass';

import { EventDispatcher } from './EventDispatcher';


const canvas = document.createElement('canvas');
const context = canvas.getContext('webgl2');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, context: context });

const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0xffffff, .001, 15000);
// scene.fog = new THREE.Fog(0xffffff, 1000, 3000);

const imageObject = new THREE.Object3D()
imageObject.position.y = 30

const viewObject = new THREE.Object3D()
viewObject.add(imageObject)
scene.add(viewObject)


let camera;
// {
//     camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, .01, 10000);
//     camera.position.fromArray([0, 1000, 0])
//     camera.lookAt(0, 0, 0)
//     camera.zoom = 5
//     camera.updateProjectionMatrix()
//     imageObject.rotation.x = -Math.PI / 3
// }

{
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );

    camera.position.fromArray([0, 150, 200])
    camera.lookAt(0, 0, 0)

}

// const controls = new OrbitControls(camera, renderer.domElement);
const controls = new Control(renderer, imageObject);

const alight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
scene.add(alight);

const dlight = new THREE.DirectionalLight(0xffffff, 1);
dlight.position.set(0, 100, 0);
scene.add(dlight);

const colck = new THREE.Clock()


const groundGeometry = new THREE.PlaneGeometry(100000, 100000);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.y = -60;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// const trailGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 50);
// const trailMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
// const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
// scene.add(trailMesh);

// 创建 EffectComposer
const composer = new EffectComposer(renderer);

// 添加渲染通道
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 添加虚幻 Bloom 效果
// const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),0.1, 0.2, 0.4);
// // bloomPass.threshold = 0.1;
// // bloomPass.strength = 1.5;
// // bloomPass.radius = 0.4;
// composer.addPass(bloomPass);

// const trailPass = new TrailPass(scene, camera, trailMesh);
// composer.addPass(trailPass);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const cellOffset = [
    new THREE.Vector3(0, -10, 0),
    new THREE.Vector3(0, -20, 0),
    new THREE.Vector3(0, -10, 0),
    new THREE.Vector3(0, 0, 0)
]

const cellArray = [
    {
        numImages: 0,
        labelPointIndex: 0,
        type: 101,
        name: "nature",
        screenPosition: new THREE.Vector2(),
        images: []
    },
    {
        numImages: 0,
        labelPointIndex: 0,
        type: 102,
        name: "design",
        screenPosition: new THREE.Vector2(),
        images: []
    },
    {
        numImages: 0,
        labelPointIndex: 0,
        type: 103,
        name: "anime",
        screenPosition: new THREE.Vector2(),
        images: []
    },
    {
        numImages: 0,
        labelPointIndex: 0,
        type: 104,
        name: "people",
        screenPosition: new THREE.Vector2(),
        images: []
    },
]


window.THREE = THREE
let self;
export class MidjourneyPhotoWall extends EventDispatcher {

    constructor(images) {
        
        super()

        self = this;

        this.groundMaterial = groundMaterial

        this.selectObject = null
        this.selectIndex = -1
        this.cellArray = cellArray

        this.controls = controls

        images.forEach((item, index) => {

            switch (item.type) {

                case 101:
                    item.cellIndex = 0
                    cellArray[0].images.push(item)
                    break;
                case 102:
                    item.cellIndex = 1
                    cellArray[1].images.push(item)
                    break;
                case 103:
                    item.cellIndex = 2
                    cellArray[2].images.push(item)
                    break;
                case 104:
                    item.cellIndex = 3
                    cellArray[3].images.push(item)
                    break;

            }

        })

        this.images = []

        let _duxLabelIndex = 0;
        cellArray.forEach((item, index) => {
            item.numImages = item.images.length
            item.labelPointIndex = _duxLabelIndex + Math.floor(item.numImages * .5)
            this.images.push(...item.images)
            _duxLabelIndex += item.numImages
        })

        this.numImages = images.length;
        this.points = getRingPoints(this.numImages, 100);

    }

    init() {

        const { images, numImages, points } = this

        for (let i = 0; i < numImages; i++) {

            const geometry = new THREE.PlaneGeometry(10, 10)
            const material = new THREE.MeshBasicMaterial({ map: null, side: THREE.DoubleSide })
            const plane = new THREE.Mesh(geometry, material)

            plane.userData.options = images[i]

            plane.position.copy(points[i])

            if (images[i]) {
                plane.position.add(cellOffset[images[i].cellIndex % 4])
            }
            const lookAtPoint = points[i].clone().normalize();
            plane.lookAt(lookAtPoint);
            plane.rotateY(Math.PI / 2);

            imageObject.add(plane)

        }


        return new Promise((resolve, reject) => {

            loadImages(images, function (textures, i) {
                const texture = textures[i % images.length]
                imageObject.children[i].material.needsUpdate = true
                imageObject.children[i].material.map = texture;
            })

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            composer.setSize(window.innerWidth, window.innerHeight);
            composer.setPixelRatio(window.devicePixelRatio);

            document.querySelector("#viewport").appendChild(renderer.domElement);

            window.addEventListener("resize", onWindowResize);
            window.addEventListener('mousemove', onMouseMove, false);

            requestAnimationFrame(animate);

            setTimeout(() => {
                resolve()
            })
        })

    }

    update() {

        const { points, numImages, cellArray, images } = this

        _rotation.z = -mouse.x * Math.PI / 60
        _rotation.x = -mouse.y * Math.PI / 60

        _quaternion.setFromEuler(_rotation)

        viewObject.quaternion.slerp(_quaternion, .05)

        imageObject.children.forEach((object, i) => {

            _position.copy(points[i])

            if (needSelect) {

                if (images[i]) {
                    _position.add(cellOffset[images[i].cellIndex % 4])
                }

            }

            object.position.lerp(_position, .1)
            object.scale.lerp(unSelectScale, .2)
            // const lookAtPoint = points[i].clone().normalize();
            // object.lookAt(lookAtPoint);
            // object.rotateY(Math.PI / 2);

        })

        needSelect && raycasterImagesObject(mouse)

        // groundMaterial.color.lerp(selectColor, .1)


        for (let i in cellArray) {

            const point = getPoint(cellArray[i].labelPointIndex, numImages, 120)


            point.add(cellOffset[i % 4])

            point.y += 30

            imageObject.localToWorld(point)

            getScreenPosition(cellArray[i].screenPosition, point);

        }

        this.dispatchEvent({ type: 'change' });

    }


}

const unSelectScale = new THREE.Vector3(1.0, 1.0, 1.0)
const selectScale = new THREE.Vector3(2.0, 2.0, 2.0)
const selectColor = new THREE.Color()
let selectTimer;

function raycasterImagesObject(mouse) {
    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(imageObject.children);

    if (intersects.length > 0) {

        for (let i = 0; i < intersects.length; i++) {

            self.selectObject = intersects[0].object;

            // console.log(self.selectObject);

            let texture = intersects[i].object.material.map;

            if (!!texture) {

                intersects[0].object.scale.lerp(selectScale, .5);

                const dominantColor = getDominantColor(texture.image);


                selectColor.setRGB(dominantColor[0] / 255, dominantColor[1] / 255, dominantColor[2] / 255)

            }

            break;

        }

        self.dispatchEvent({ type: 'select', selectObject: self.selectObject });

        clearTimeout(selectTimer)
        selectTimer = setTimeout(() => {
            self.selectObject = null
            self.dispatchEvent({ type: 'select', selectObject: self.selectObject });
        }, 2000)
        // console.log(self.selectObject);
    }



}

const _mouse = new THREE.Vector2()

function onMouseMove(event) {
    event.preventDefault();
    _mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    _mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    mouse.lerp(_mouse, .2);

}

function getRingPoints(numPoints, radius) {
    const points = [];

    for (let i = 0; i < numPoints; i++) {

        points.push(getPoint(i, numPoints, radius));

    }

    return points;
}

function getPoint(index, numPoints, radius) {

    const angle = (index / numPoints) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = 0;
    const z = Math.sin(angle) * radius;

    return new THREE.Vector3(x, y, z)

}

function getDominantColor(image) {
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = 1;
    colorCanvas.height = 1;
    const colorContext = colorCanvas.getContext('2d');
    colorContext.drawImage(image, 0, 0, 1, 1);
    const imageData = colorContext.getImageData(0, 0, 1, 1);
    return imageData.data;
}


function lerp(x, y, t) {

    return (y - x) * t + x;

}

function loadImages(data = [], onProgress = () => { }) {

    let index = 0
    const imageLoader = new THREE.TextureLoader()
    const textures = []

    for (let i = data.length - 1; i >= 0; i--) {

        imageLoader.load(`./resized_images/${data[i].simple_filename}`, (texture) => {

            textures[i] = (texture);

            onProgress(textures, i);

        });

    }

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;


    // window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

const _rotation = new THREE.Euler(0, 0, 0)
const _quaternion = new THREE.Quaternion()

let needSelect = true;
let timer = null;

function handleControlStart() {
    needSelect = false
}
function handleControlChange() {
    needSelect = false
    clearTimeout(timer)
    timer = setTimeout(() => {
        needSelect = true
    }, 500)
}
function handleControlEnd() {
    needSelect = true
}

controls.addEventListener("start", handleControlStart)
controls.addEventListener("wheel", handleControlChange)
controls.addEventListener("end", handleControlEnd)

const _position = new THREE.Vector3()

// 更新 div 位置以跟随 Object3D
const _point = new THREE.Vector3()
function getScreenPosition(screenPosition, point) {
    _point.copy(point)
    camera.updateMatrixWorld();
    _point.project(camera);

    screenPosition.x = (_point.x + 1) * window.innerWidth / 2;
    screenPosition.y = (-_point.y + 1) * window.innerHeight / 2;

    return screenPosition
}


function animate() {

    self.update()

    controls.update();

    render();

    requestAnimationFrame(animate);

}

function render() {

    composer.render()

}
