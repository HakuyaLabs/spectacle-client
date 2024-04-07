import {WebSocketClient} from "./WebSocketClient.ts";

export class SpectacleClient extends WebSocketClient {

  actionHandler(action: string, data: any): boolean {
    switch (action) {
      case "interaction":
        this.emitter.emit("receivedInteraction", data)
        return true
      case "poll":
        this.emitter.emit("receivedPoll", data)
        return true
      case "countdown":
        this.emitter.emit("receivedCountdown", data)
        return true
    }
    return false
  }

  action(deckId: string, actionId: string, data: string | null = null) {
    console.log("Sending action", deckId, actionId, data)
    this.send("action", { deckId, actionId, data })
  }

  poll(pollId: string, optionId: string) {
    this.send("poll", { pollId, optionId })
  }

  async getInteraction() {
    this.send("getInteraction")
    await this.wait("interaction")
  }

}
