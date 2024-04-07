<script setup lang="ts">
import ActionGrid from './components/ActionGrid.vue'

import {onMounted, onUnmounted, ref} from 'vue'
import {useStore} from "./data/store.ts";
import {InteractionType, Poll} from "./data/models.ts";
import PollGrid from "./components/PollGrid.vue";

const store = useStore()

const settingsServerUrl = ref(store.serverUrl)
const visible = ref(false)

function updateSettings() {
  store.serverUrl = settingsServerUrl.value
  unsubscribeClientEvents()
  store.reconnectClient()
  subscribeClientEvents()
}

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
  <div class="flex justify-content-between gap-2 mt-4 mb-8 mr-3">
    <div class="logo" style="height: 0px;">
      <img src="./assets/warudo.png" alt="Logo" style="width: 250px; margin-top: -62px; margin-left: -25px;" />
    </div>
    <Button label="Settings" @click="visible = true" />
  </div>

  <ActionGrid v-if="store.interaction.type === InteractionType.Deck" />
  <PollGrid v-else-if="store.interaction.type === InteractionType.Poll" />

  <Dialog v-model:visible="visible" modal header="Settings" :style="{ width: '25rem' }">
    <div class="flex align-items-center gap-3 mb-3">
      <label class="font-semibold w-6rem">Server URL</label>
      <InputText class="flex-auto" autocomplete="off" v-model="settingsServerUrl" />
    </div>
    <div class="flex justify-content-end gap-2">
      <Button type="button" label="Save" @click="visible = false; updateSettings()"></Button>
    </div>
  </Dialog>

</template>

<style scoped>
</style>
