<script setup lang="ts">
import { usePuzzleStore } from '@/stores/puzzleStore';

const puzzleStore = usePuzzleStore();
</script>

<template>
  <button class="btn" :disabled="puzzleStore.isImageLoading" @click="puzzleStore.changePuzzle">
    Change Puzzle
  </button>
</template>

<style scoped>
.btn {
  background-color: var(--primary-color);
  border-radius: 6px;
  border-width: 0;
  box-shadow:
    rgba(50, 50, 93, 0.1) 0 0 0 1px inset,
    rgba(50, 50, 93, 0.1) 0 2px 5px 0,
    rgba(0, 0, 0, 0.07) 0 1px 1px 0;
  color: #fff;
  cursor: pointer;
  font-size: 100%;
  outline: none;
  padding: 12px 25px;
  transition: box-shadow 0.08s ease-in;
  width: 100%;
}

.btn:hover,
.btn:focus {
  box-shadow:
    rgba(50, 50, 93, 0.1) 0 0 0 1px inset,
    rgba(50, 50, 93, 0.2) 0 6px 15px 0,
    rgba(0, 0, 0, 0.1) 0 2px 2px 0,
    rgba(50, 151, 211, 0.3) 0 0 0 4px;
}
</style>
