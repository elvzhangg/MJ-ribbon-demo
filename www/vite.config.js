import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
export default defineConfig({
  // base: "../",
  build: {
    outDir: '../dist'
  },
  plugins: [
    glsl({
      include: ["**/*.{glsl,vert,frag,vs,fs}"],
      exclude: undefined,
      warnDuplicatedImports: true,
      defaultExtension: "glsl",
      compress: false,
      watch: true,
      root: "src/editor/core/shader/",
    }),
    vue()
  ],
})
