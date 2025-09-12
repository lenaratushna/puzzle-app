<script setup lang="ts">
import { usePuzzleStore } from '@/stores/puzzleStore';

const puzzleStore = usePuzzleStore();
</script>

<template>
  <img v-if="puzzleStore.puzzleImage" :src="puzzleStore.puzzleImage" />
</template>

<style scoped>
img {
  max-height: 100%;
  max-width: 100%;
  height: auto;
  width: auto;
  object-fit: contain;
  display: block;
}
</style>
