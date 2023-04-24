import { EventDispatcher } from './EventDispatcher';

let isDragging = false;
let lastMouseX, lastMouseY;
let lastTime = 0;
let velocity = 0;
let dampingFactor = 0.9;

let mesh = null


export class Control extends EventDispatcher {

    constructor(renderer, object) {
        super();

        mesh = object

        const self = this;

        function onMouseDown(event) {

            event.preventDefault()

            document.addEventListener("pointermove", onMouseMove);
            document.addEventListener("pointerup", onMouseUp);

            isDragging = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            lastTime = performance.now();

            self.dispatchEvent({ type: 'start' });

        }

        function onMouseMove(event) {
            if (!isDragging) return;

            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;

            const dx = event.clientX - lastMouseX;
            const dy = event.clientY - lastMouseY;

            const dz = Math.sqrt(dx * dx + dy * dy) * (dx > 0 ? 1 : -1);

            // 计算水平和垂直速度
            velocity = dz / deltaTime * .2;

            // 更新旋转（可以根据你的需求调整）
            if (!!mesh) {
                mesh.rotation.y += dz * 0.02;
            }

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            lastTime = currentTime;

            self.dispatchEvent({ type: 'change' });

        }

        function onMouseUp(event) {
            event.preventDefault()
            isDragging = false;

            window.removeEventListener("pointermove", onMouseMove)
            window.removeEventListener("pointerup", onMouseUp)

            self.dispatchEvent({ type: 'end' });

        }

        function onMouseWheel(event) {

            const deltaTime = (event.timeStamp - lastTime)

            if (deltaTime > 200) {

                lastTime = event.timeStamp;

            }

            velocity = event.deltaY / deltaTime * .1;

            if (!!mesh) {
                const delta = event.deltaY * 0.001; // 可以根据需要调整这个值
                mesh.rotation.y += delta;
            }

            self.dispatchEvent({ type: 'wheel' });

        }

        document.addEventListener('pointerdown', onMouseDown, false);
        document.addEventListener('wheel', onMouseWheel, false);

    }

    update() {

        if (!isDragging) {
            // 应用惯性并逐渐减小速度
            mesh.rotation.y += velocity;

            // 逐渐减小速度
            velocity *= dampingFactor;

            // 如果速度非常小，则将其设置为零
            if (Math.abs(velocity) < 0.001) velocity = 0;
        }

    }

    dispose() {

        window.removeEventListener('pointerdown', onMouseDown, false);
        window.removeEventListener('pointermove', onMouseMove, false);
        window.removeEventListener('pointerup', onMouseUp, false);
        window.removeEventListener('wheel', onMouseWheel, false);

    }

}

