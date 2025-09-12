<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { usePuzzleStore, type IPuzzlePiece } from '@/stores/puzzleStore';

const store = usePuzzleStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const activePiece = ref<IPuzzlePiece | null>(null);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);

const canvasWidth = ref(window.innerWidth);
const canvasHeight = ref(window.innerHeight);

const scale = computed(() => {
  if (!store.image) return 1;
  const maxFieldWidth = canvasWidth.value * 0.6;
  const maxFieldHeight = canvasHeight.value * 0.6;
  const widthRatio = maxFieldWidth / store.image.width;
  const heightRatio = maxFieldHeight / store.image.height;
  return Math.min(widthRatio, heightRatio);
});

const fieldWidth = computed(() => (store.image ? store.image.width * scale.value : 0));
const fieldHeight = computed(() => (store.image ? store.image.height * scale.value : 0));
const fieldX = computed(() => (canvasWidth.value - fieldWidth.value) / 2);
const fieldY = computed(() => (canvasHeight.value - fieldHeight.value) / 2);

const resizeCanvas = () => {
  if (canvasRef.value && canvasRef.value.parentElement) {
    canvasWidth.value = canvasRef.value.parentElement.clientWidth;
    canvasHeight.value = canvasRef.value.parentElement.clientHeight;
    canvasRef.value.width = canvasWidth.value;
    canvasRef.value.height = canvasHeight.value;
    if (store.image) {
      cutImageIntoPieces(store.image);
      drawPieces();
    }
  }
};

onMounted(() => {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
});

watch(
  () => store.image,
  (newImage) => {
    if (newImage && canvasRef.value) {
      context.value = canvasRef.value.getContext('2d');
      cutImageIntoPieces(newImage);
    }
  },
);

const cutImageIntoPieces = (image: HTMLImageElement) => {
  const rows = 4;
  const cols = 4;
  const pieceWidth = image.width / cols;
  const pieceHeight = image.height / rows;

  const pieces: IPuzzlePiece[] = [];
  const scaledPieceWidth = pieceWidth * scale.value;
  const scaledPieceHeight = pieceHeight * scale.value;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = scaledPieceWidth;
      pieceCanvas.height = scaledPieceHeight;
      const pieceContext = pieceCanvas.getContext('2d');

      if (pieceContext) {
        pieceContext.drawImage(
          image,
          j * pieceWidth,
          i * pieceHeight,
          pieceWidth,
          pieceHeight,
          0,
          0,
          scaledPieceWidth,
          scaledPieceHeight,
        );
      }

      pieces.push({
        id: `${i}-${j}`,
        image: pieceCanvas,
        originalX: j * scaledPieceWidth + fieldX.value,
        originalY: i * scaledPieceHeight + fieldY.value,
        currentX: 0,
        currentY: 0,
        isFixed: false,
      });
    }
  }

  store.setPieces(pieces);
  store.shufflePieces(canvasWidth.value, canvasHeight.value, scale.value);
  drawPieces();
};

const drawPieces = () => {
  if (!context.value || !canvasRef.value || !store.image) return;

  context.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

  if (context.value) {
    context.value.strokeStyle = 'black';
    context.value.lineWidth = 1;
    context.value.strokeRect(fieldX.value, fieldY.value, fieldWidth.value, fieldHeight.value);
  }

  store.pieces.forEach((piece) => {
    if (context.value && piece.id !== activePiece.value?.id) {
      if (piece.isFixed) {
        context.value.strokeStyle = 'green';
        context.value.lineWidth = 2;
        context.value.strokeRect(
          piece.currentX,
          piece.currentY,
          piece.image.width,
          piece.image.height,
        );
      }
      context.value.drawImage(piece.image, piece.currentX, piece.currentY);
    }
  });

  if (context.value && activePiece.value) {
    context.value.drawImage(
      activePiece.value.image,
      activePiece.value.currentX,
      activePiece.value.currentY,
    );
  }
};

const handleMouseDown = (event: MouseEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const clickedPiece = [...store.pieces]
    .reverse()
    .find(
      (piece) =>
        mouseX > piece.currentX &&
        mouseX < piece.currentX + piece.image.width &&
        mouseY > piece.currentY &&
        mouseY < piece.currentY + piece.image.height &&
        !piece.isFixed,
    );

  if (clickedPiece) {
    isDragging.value = true;
    activePiece.value = clickedPiece;
    offsetX.value = mouseX - clickedPiece.currentX;
    offsetY.value = mouseY - clickedPiece.currentY;
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !activePiece.value || !canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();

  const newX = event.clientX - rect.left - offsetX.value;
  const newY = event.clientY - rect.top - offsetY.value;

  store.updatePiecePosition(activePiece.value.id, newX, newY);
  drawPieces();
};

const handleMouseUp = () => {
  if (!isDragging.value || !activePiece.value) {
    isDragging.value = false;
    activePiece.value = null;
    return;
  }

  const tolerance = 15;
  const isCorrect =
    Math.abs(activePiece.value.currentX - activePiece.value.originalX) < tolerance &&
    Math.abs(activePiece.value.currentY - activePiece.value.originalY) < tolerance;

  if (isCorrect) {
    store.updatePiecePosition(
      activePiece.value.id,
      activePiece.value.originalX,
      activePiece.value.originalY,
    );
    store.updatePieceStatus(activePiece.value.id, true);
    drawPieces();
  }

  isDragging.value = false;
  activePiece.value = null;
  drawPieces();
};
</script>

<template>
  <canvas
    ref="canvasRef"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  ></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
