<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  source: String,
})
</script>

<template>
  <div class="icon">
    <img v-if="props.source === '$SIGGRAPH$'" src="../assets/siggraph.svg" class="icon-image" />
    <div v-else>{{ props.source }}</div>
  </div>
</template>

<style scoped>
.icon {
  display: flex;
  justify-content: center;
  align-items: center;
}
.icon-image {
  width: 4rem;
  height: 4rem;
}
</style>
