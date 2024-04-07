<template>
  <div class="description text-center mt-6 mb-4">
    {{ poll.description }}
  </div>
  <div class="mt-4 mb-6 mx-4" :style="{ 'opacity': store.countdownVisible ? 1 : 0 }">
    <ProgressBar :show-value="false" :value="Math.floor(store.countdownValue * 100)"></ProgressBar>
  </div>
  <div class="interaction-grid">
    <button
        v-for="item in poll.options" :key="item.id"
        :class="{'selected': item.id === selectedOptionId}"
        class="interaction-grid-button"
        @click="handleClick(item, $event)"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
    >
      <div class="flex flex-column">
        <div class="option">
          {{ item.displayName }}
        </div>
        <div class="votes">
          {{ item.votes }} votes
        </div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, Ref, ref} from 'vue'
import { useStore } from "../data/store"
import {Poll} from "../data/models.ts";

const store = useStore()
const poll = computed(() => store.interaction as Poll)
const client = store.client
const selectedOptionId: Ref<string | null> = ref(null)

function handleClick(optionItem, event) {
  client.poll(store.interaction.id, optionItem.id)
  selectedOptionId.value = optionItem.id
}

function handleMouseDown(event) {
  event.currentTarget.style.transform = 'scale(0.9)';
}

function handleMouseUp(event) {
  event.currentTarget.style.transform = 'scale(1)';
}
</script>

<style scoped lang="scss">

.description {
  font-size: 36px;
}

.option {
  font-size: 1.5rem;
  font-weight: bold;
}

.votes {
  font-size: 1rem;
}
</style>
