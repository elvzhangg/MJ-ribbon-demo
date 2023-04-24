import * as THREE from "three";
import { Pass } from "three/examples/jsm/postprocessing/Pass";

let trailLength = 0;

export class TrailPass extends Pass {
    constructor(scene, camera, trailMesh) {
        super();
        this.scene = scene;
        this.camera = camera;
        this.trailMesh = trailMesh;

        let lastMousePosition = new THREE.Vector2();

        window.addEventListener('pointermove', onMouseMove, false);

        function onMouseMove(event) {
            const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

            const mousePosition = new THREE.Vector2(mouseX, mouseY);
            trailLength = mousePosition.distanceTo(lastMousePosition);
            lastMousePosition.copy(mousePosition);

            trailMesh.position.x = mouseX * window.innerWidth / 2;
            trailMesh.position.y = mouseY * window.innerHeight / 2;
        }
    }

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        const trailMaterial = this.trailMesh.material;

        // 在拖尾效果上添加基于速度和时间的波动
        const timeFactor = deltaTime * 60; // 使动画在不同设备上保持一致
        const opacityFactor = Math.sin(trailLength / 100 * timeFactor) * 0.5 + 0.5;
        trailMaterial.opacity = opacityFactor;

        renderer.setRenderTarget(writeBuffer);
        renderer.clear();
        renderer.render(this.scene, this.camera);
        renderer.setRenderTarget(readBuffer);
        renderer.clear();
        renderer.render(this.scene, this.camera);
    }
}
