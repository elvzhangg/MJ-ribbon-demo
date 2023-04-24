<script setup>
import images from "../assets/images.json";

import { ref, onMounted } from "vue";

import { MidjourneyPhotoWall } from "../core/index";

const theme = ref("dark");

const start = ref(false);
const hide = ref(false);
const isShow = ref(false);
const labelHide = ref(false);

const midjourneyPhotoWall = new MidjourneyPhotoWall(images);

const labels = ref([]);
const imageSrc = ref("");
const msgContent = ref("");

defineProps({});

onMounted(() => {
  midjourneyPhotoWall.addEventListener("select", function (event) {
    if (!!event.selectObject) {
      hide.value = true;
      start.value = true;
      isShow.value = true;
      imageSrc.value = `/resized_images/${event.selectObject.userData.options.simple_filename}`;
      msgContent.value = event.selectObject.userData.options.msg_content;
    } else {
      hide.value = false;
      start.value = false;
      isShow.value = false;
    }
  });

  const labelElement = document.querySelector(".labels");
  midjourneyPhotoWall.addEventListener("change", function (event) {
    midjourneyPhotoWall.cellArray.forEach((item, index) => {
      if (labelElement.children[index]) {
        labelElement.children[
          index
        ].style.transform = `translate(-50%, -50%) translate(${item.screenPosition.x}px, ${item.screenPosition.y}px)`;
      }
    });

    const color = midjourneyPhotoWall.groundMaterial.color;
    if (
      color.r * 255 * 0.299 + color.g * 255 * 0.587 + color.b * 255 * 0.114 >
      149
    ) {
      // color = black
      if (theme.value !== "dark") {
        theme.value = "dark";
      }
    } else {
      if (theme.value !== "light") {
        theme.value = "light";
      }
    }
  });

  midjourneyPhotoWall.controls.addEventListener("start", function () {
    hide.value = true;
    labelHide.value = true;
  });
  midjourneyPhotoWall.controls.addEventListener("change", function () {});
  midjourneyPhotoWall.controls.addEventListener("end", function () {
    if (!midjourneyPhotoWall.selectObject) {
      hide.value = false;
    }
    labelHide.value = false;
  });

  let timer = null;
  midjourneyPhotoWall.controls.addEventListener("wheel", function () {
    hide.value = true;
    labelHide.value = true;

    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!midjourneyPhotoWall.selectObject) {
        hide.value = false;
      }
      labelHide.value = false;
    }, 500);
  });

  midjourneyPhotoWall.init().then(() => {
    start.value = true;

    labels.value = midjourneyPhotoWall.cellArray;
  });
});
</script>

<template>
  <div class="content" :class="theme">
    <div id="viewport"></div>
    <div class="center-content" :class="{ show: isShow }">
      <img :src="imageSrc" alt="" />
      <p class="center-text">
        <span>{{ msgContent }}</span>
      </p>
    </div>
    <div class="center-logo" :class="{ start: start, hide: hide }">
      <i class="center-bg"></i>
      <p class="center-text">Midjourney.</p>
    </div>
    <div class="labels" @pointerdown.stop :class="{ hide: labelHide }">
      <i v-for="(label, index) in labels" :key="index">
        {{ `${label.name} (${label.numImages})` }}
      </i>
    </div>
  </div>
</template>

<style>
.content {
  position: relative;
  overflow: hidden;
  color: #000000;
}

.content.light > .labels,
.content.light > .center-content {
  color: #fff;
}

.content,
.content.dark > .labels,
.content.dark > .center-content {
  color: #000;
}

#viewport > canvas {
  display: block;
}

.center-content {
  position: absolute;
  visibility: hidden;
  left: 50%;
  top: 50%;
  width: 32vh;
  margin: 0;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 0;
}

.center-content.show {
  visibility: initial;
}

.center-content > img {
  display: block;
  width: 32vh;
  height: 32vh;
}

.center-content > p {
  position: relative;
  width: 32vh;
  margin-top: 10px;
  color: inherit;
}

.center-content > p > span {
  overflow: hidden;
  display: block;
  height: 48px;
  line-height: 16px;
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 显示3行文本 */
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.center-content > p.center-text::after {
  content: "\“";
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  font-size: 40px;
  line-height: 40px;
  font-family: serif;
  transform: translate(-24px, 0);
}

.center-logo {
  position: absolute;
  left: 50%;
  top: 50%;
  margin: 0;
  padding: 0;
  opacity: 1;
  transform: translate(-50%, -50%);
  transition: translate 0.4s, opacity 0.3s;
  font-family: "PlusJakartaSans-Regular";
}

.center-logo > .center-text {
  font-size: 10vh;
  color: #ffffff;
  transition: color 0;
  transition-delay: 0.5s;
}

.center-logo > .center-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background: #000000;
  z-index: -1;
  transform: scaleX(1.2) scaleY(1.2);
  transition: transform 0.5s;
}

.center-logo.start > .center-bg {
  transform: scaleX(0) scaleY(1.2);
}

.center-logo.start > .center-text {
  color: #000000;
}

.center-logo.hide {
  opacity: 0;
}

.labels {
  position: absolute;
  left: 0;
  top: 0;
  color: inherit;
  opacity: 1;
  transition: opacity 0.3s;
}

.labels.hide {
  opacity: 0;
}

.labels > i {
  display: block;
  cursor: pointer;
  font-style: initial;
  transform: translate(-50%, -50%);
}

.labels > i:hover {
  opacity: 0.5;
}
</style>
