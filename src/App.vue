<script setup lang="ts">
import { onMounted } from 'vue';
import PuzzleCanvas from './components/PuzzleCanvas.vue';
import PuzzlePreview from './components/PuzzlePreview.vue';
import { usePuzzleStore } from './stores/puzzleStore';
import PuzzleChangeBtn from './components/PuzzleChangeBtn.vue';

const puzzleStore = usePuzzleStore();

onMounted(() => {
  puzzleStore.initPuzzleImage();
});
</script>

<template>
  <div class="app-container">
    <div class="side-panel">
      <h1 class="app-title">Piece by Piece</h1>
      <div class="preview-container">
        <PuzzlePreview />
      </div>
      <div class="btn-container">
        <PuzzleChangeBtn />
      </div>
    </div>
    <div class="canvas-container">
      <PuzzleCanvas class="responsive-canvas" />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
}

.app-title {
  padding: 8px;
  text-align: center;
  color: var(--primary-color);
}

.side-panel {
  background-color: #eee;
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .side-panel {
    height: 20%;
    width: 100%;
  }

  .canvas-container {
    height: 80%;
    width: 100%;
  }
}

@media (min-width: 769px) {
  .side-panel {
    width: 20%;
    height: 100%;
  }

  .canvas-container {
    width: 80%;
    height: 100%;
  }
}

.preview-container {
  min-height: 210px;
}

.btn-container {
  padding: 8px;
}

.responsive-canvas {
  display: block;
}
</style>
