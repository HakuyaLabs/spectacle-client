<template>
  <div class="description text-center mt-6 mb-6">
    {{ deck.description }}
  </div>
  <div class="interaction-grid">
    <button
        v-for="item in deck.actions" :key="item.id"
        class="interaction-grid-button"
        :style="{ backgroundColor: rgba2hex(item.backgroundColor) }"
        @click="handleClick(item, $event)"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
    >
      <Icon :source="item.displayName" />
    </button>
  </div>
  <teleport to="body">
    <div v-for="emoji in flyingEmojis" :key="emoji.id" :style="emoji.style">
      <Icon :source="emoji.char" />
    </div>
  </teleport>
</template>

<script setup lang="ts">
import {computed, reactive} from 'vue'
import { useStore } from "../data/store"
import {Deck} from "../data/models.ts";
import {rgba2hex} from "../utils/functions.ts";
import Icon from "./Icon.vue";

const store = useStore()
const deck = computed(() => store.interaction as Deck)
const client = store.client

const flyingEmojis: Record<number, { id: number, char: string, style: Record<string, any> }> = reactive({})

function animateEmoji(emoji, initialX, initialY) {
  let startTime;
  const duration = 2000; // Duration of the animation in milliseconds

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  const curveDirection = Math.random() < 0.5 ? -1 : 1; // Randomly -1 (left) or 1 (right)
  const amplitude = Math.random() * 80 + 40; // Random amplitude for the curve, 10 to 30 pixels

  const frame = (timestamp) => {
    if (!startTime) startTime = timestamp;

    const rawProgress = (timestamp - startTime) / duration;
    const progress = Math.min(rawProgress, 1);
    const easedProgress = easeOutCubic(progress);

    // Curved and non-linear horizontal movement
    const curve = Math.sin(progress * Math.PI) * amplitude * curveDirection;
    const x = initialX + curve;

    // Non-linear vertical movement to the top
    const distanceToTop = (initialY - window.scrollY) * 2;
    const y = initialY - distanceToTop * easedProgress;

    const scale = 1 + easedProgress * 2; // Scale down non-linearly
    const opacity = 1 - easedProgress; // Fade out non-linearly

    emoji.style = {
      ...emoji.style,
      left: `${x}px`,
      top: `${y}px`,
      transform: `scale(${scale})`,
      opacity: `${opacity}`,
    };

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      // Remove the emoji after the animation completes
      delete flyingEmojis[emoji.id];
    }
  };

  requestAnimationFrame(frame);
}

function handleClick(actionItem, event) {
  const bounds = event.target.getBoundingClientRect();
  // Assuming the average size of an emoji is about the same as font-size
  const emojiSize = 64; // Assuming square emojis for simplicity

  // Adjust initial coordinates to account for the emoji's dimensions
  const initialX = bounds.left + (bounds.width / 2) - (emojiSize / 2);
  const initialY = (bounds.top + window.scrollY) - (emojiSize / 2);

  const emoji = reactive({
    id: Date.now(),
    char: actionItem.displayName,
    style: {
      position: 'fixed',
      left: `${initialX}px`,
      top: `${initialY}px`,
      fontSize: '64px',
      pointerEvents: 'none', // Ignore pointer events to allow clicking through
      zIndex: 1000, // Ensure emojis are on top of other elements
    },
  });

  flyingEmojis[emoji.id] = emoji
  animateEmoji(emoji, initialX, initialY)

  client.action(store.interaction.id, actionItem.id)
}

function handleMouseDown(event) {
  event.currentTarget.style.transform = 'scale(0.9)';
}

function handleMouseUp(event) {
  event.currentTarget.style.transform = 'scale(1)';
}
</script>

<style scoped>
.description {
  font-size: 36px;
}
</style>
