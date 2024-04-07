import { defineStore } from "pinia";
import {computed, ref} from "vue";
import {SpectacleClient} from "../client/SpectacleClient.ts";
import {InteractionType} from "./models.ts";

export const useStore = defineStore('main', () => {
  const serverUrl = ref(`ws://${window.location.hostname}:19876`)
  const client = ref(new SpectacleClient(serverUrl.value).connect())
  const interaction = ref({ type: InteractionType.Empty, id: '' })
  const countdownValue = ref(0)

  function reconnectClient() {
    client.value.disconnect()
    client.value.endpoint = serverUrl.value
    client.value.connect()
  }

  const countdownVisible = computed(() => countdownValue.value > 0)
  function startCountdown(duration: number) {
    const startTimestamp = Date.now()
    function countdown() {
      countdownValue.value = 1 - ((Date.now() - startTimestamp) / 1000) / duration
      setTimeout(() => {
        if (countdownValue.value > 0) {
          countdown()
        }
      }, 1)
    }
    countdown()
  }

  return { serverUrl, client, interaction,
    countdownValue, countdownVisible, startCountdown,
    reconnectClient }
})
