<script setup lang="ts">
import ActionGrid from './components/ActionGrid.vue'

import {onMounted, onUnmounted} from 'vue'
import {useStore} from "./data/store.ts";
import {InteractionType, Poll} from "./data/models.ts";
import PollGrid from "./components/PollGrid.vue";

const store = useStore()

const eventUnsubscribes = []

function subscribeClientEvents() {
  const client = store.client
  eventUnsubscribes.forEach(it => it())
  eventUnsubscribes.push(
    client.emitter.on('connected', () => {
      console.log('Connected to server')
      // Fetch initial data
      client.getInteraction()
    }),
    client.emitter.on('disconnected', () => {
      console.log('Disconnected from server')
    }),
    client.emitter.on('error', (error) => {
      console.error('Error:', error)
    }),
    client.emitter.on('receivedInteraction', (interaction) => {
      console.log('Received interaction:', interaction)
      store.interaction = interaction
    }),
    client.emitter.on('receivedPoll', (data: Record<string, number>) => {
      if (store.interaction.type === InteractionType.Poll) {
        const poll = store.interaction as Poll
        poll.options.forEach(option => {
          option.votes = data[option.id] || 0
        })
      }
    }),
    client.emitter.on('receivedCountdown', (countdown) => {
      console.log('Received countdown:', countdown)
      store.startCountdown(countdown)
    }),
  )
}

function unsubscribeClientEvents() {
  eventUnsubscribes.forEach(it => it())
}

onMounted(() => {
  subscribeClientEvents()
})

onUnmounted(() => unsubscribeClientEvents())

</script>

<template>
  <div class="flex justify-content-center mt-4 mb-8">
    <div class="logo" style="height: 0px;">
      <img src="./assets/warudo.png" alt="Logo" style="width: 250px; margin-top: -62px; margin-left: -25px;" />
    </div>
  </div>

  <ActionGrid v-if="store.interaction.type === InteractionType.Deck" />
  <PollGrid v-else-if="store.interaction.type === InteractionType.Poll" />

</template>

<style scoped>
</style>
