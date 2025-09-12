import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export interface IPuzzlePiece {
  id: string;
  image: HTMLCanvasElement;
  originalX: number;
  originalY: number;
  currentX: number;
  currentY: number;
  isFixed: boolean;
}

export const usePuzzleStore = defineStore('puzzle', () => {
  const unsplashAccessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const puzzleImage = ref<string | null>(null);
  const image = ref<HTMLImageElement | null>(null);
  const isImageLoading = ref(false);
  const isGameStarted = ref(false);
  const pieces = ref<IPuzzlePiece[]>([]);

  const loadImage = (url: string) => {
    isImageLoading.value = true;
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        image.value = img;
        isImageLoading.value = false;
        resolve();
      };
      img.onerror = () => {
        image.value = null;
        isImageLoading.value = false;
        reject(new Error('Failed to load image.'));
      };
      img.src = url;
    });
  };

  const fetchPuzzleImage = async () => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?orientation=landscape&client_id=${unsplashAccessKey}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText || 'Unknown error'}`);
      }
      const data = await response.json();
      const imageUrl = data.urls.full;
      puzzleImage.value = imageUrl;
      localStorage.setItem('puzzle_image', imageUrl);
    } catch (error) {
      console.error('Error fetching image:', error);
      alert('Failed to fetch image. Please try again later');
      puzzleImage.value = null;
    }
  };

  const changePuzzle = async () => {
    await fetchPuzzleImage();
    if (puzzleImage.value) {
      await loadImage(puzzleImage.value);
    }
  };

  const initPuzzleImage = async () => {
    const savedImage = localStorage.getItem('puzzle_image');
    if (savedImage) {
      puzzleImage.value = savedImage;
    } else {
      await fetchPuzzleImage();
    }
    if (puzzleImage.value) {
      await loadImage(puzzleImage.value);
    }
  };

  const setPieces = (newPieces: IPuzzlePiece[]) => {
    pieces.value = newPieces;
  };

  const shufflePieces = (canvasWidth: number, canvasHeight: number, scale: number) => {
    if (!image.value) return;

    const fieldWidth = image.value.width * scale;
    const fieldHeight = image.value.height * scale;
    const fieldX = (canvasWidth - fieldWidth) / 2;
    const fieldY = (canvasHeight - fieldHeight) / 2;

    pieces.value.forEach((piece) => {
      const randomZone = Math.floor(Math.random() * 4);
      let randomX, randomY;

      switch (randomZone) {
        case 0:
          randomX = Math.random() * (canvasWidth - piece.image.width);
          randomY = Math.random() * (fieldY - piece.image.height);
          break;
        case 1:
          randomX = Math.random() * (canvasWidth - piece.image.width);
          randomY =
            fieldY +
            fieldHeight +
            Math.random() * (canvasHeight - fieldY - fieldHeight - piece.image.height);
          break;
        case 2:
          randomX = Math.random() * (fieldX - piece.image.width);
          randomY = Math.random() * (canvasHeight - piece.image.height);
          break;
        case 3:
          randomX =
            fieldX +
            fieldWidth +
            Math.random() * (canvasWidth - fieldX - fieldWidth - piece.image.width);
          randomY = Math.random() * (canvasHeight - piece.image.height);
          break;
        default:
          randomX = Math.random() * (canvasWidth - piece.image.width);
          randomY = Math.random() * (canvasHeight - piece.image.height);
          break;
      }

      piece.currentX = randomX;
      piece.currentY = randomY;
    });
  };

  const updatePiecePosition = (pieceId: string, newX: number, newY: number) => {
    const piece = pieces.value.find((p) => p.id === pieceId);
    if (piece) {
      piece.currentX = newX;
      piece.currentY = newY;
    }
  };

  const updatePieceStatus = (pieceId: string, status: boolean) => {
    const piece = pieces.value.find((p) => p.id === pieceId);
    if (piece) {
      piece.isFixed = status;
    }
  };

  const isGameFinished = computed(() => {
    return pieces.value.every(
      (piece) =>
        Math.abs(piece.currentX - piece.originalX) < 15 &&
        Math.abs(piece.currentY - piece.originalY) < 15,
    );
  });

  return {
    pieces,
    image,
    puzzleImage,
    isImageLoading,
    isGameStarted,
    loadImage,
    fetchPuzzleImage,
    initPuzzleImage,
    changePuzzle,
    setPieces,
    shufflePieces,
    updatePiecePosition,
    updatePieceStatus,
    isGameFinished,
  };
});
