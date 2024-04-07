import {createNanoEvents, Emitter} from "nanoevents";
import {sleep, until} from "../utils/functions";
import {Interaction} from "../data/models.ts";

export interface ClientEvents {
  connected: () => void
  disconnected: () => void
  startWaiting: () => void
  stopWaiting: () => void
  error: (error: string) => void
  receivedInteraction: (interaction: Interaction) => void
  receivedPoll: (data: Record<string, number>) => void
  receivedCountdown: (duration: number) => void
}

export abstract class WebSocketClient {
  emitter: Emitter<ClientEvents>
  endpoint: string
  socket: WebSocket | null
  connected: boolean = false
  waiting: boolean = false
  abstract readonly actionHandler:  (action: string, data: any) => boolean

  protected constructor(endpoint: string) {
    console.log("Creating WebSocketClient with endpoint", endpoint)
    this.emitter = createNanoEvents();
    this.endpoint = endpoint
    this.socket = null
  }

  public connect() {
    try {
      this.socket = new WebSocket(`${this.endpoint}`)
    } catch (e) {
      console.error("Failed to connect to", this.endpoint)
      console.error(e)
      this.emitter.emit('error', e)
      return this
    }
    this.socket.addEventListener('message', (e) => {
      const message = JSON.parse(e.data)
      const action = message.action
      if (!action) {
        console.log("Received message but no action")
        return
      }

      const data: any = message.data
      this.actionHandler(action, data)
    })
    this.socket.onopen = () => {
      this.connected = true
      this.emitter.emit("connected")
      console.log(`Connected to ${this.endpoint}`)
    }
    this.socket.onclose = () => {
      this.connected = false
      this.waiting = false
      this.emitter.emit("disconnected")
      this.emitter.emit("stopWaiting")
      setTimeout(() => {
        console.log(`Reconnecting to ${this.endpoint}`)
        this.connect()
      }, 3000)
    }
    return this
  }

  public disconnect() {
    if (!this.socket) return;

    this.socket.close()
    this.connected = false
    this.waiting = false
    this.emitter.emit("disconnected")
    this.emitter.emit("stopWaiting")
    this.socket = null
  }

  protected send(action: string, data: any = null, log: boolean = true) {
    if (!this.socket) {
      throw new Error("Socket is not open.")
    }

    const message = JSON.stringify({ action, data })

    if (log) {
      //console.log("Sending:")
      //console.log(message)
    }

    this.socket.send(message)
  }

  protected async wait(expectedAction: string): Promise<any> {
    const task = this.internalWait(expectedAction)
    let timedOut = false
    let waited = false
    await Promise.any([sleep(100).then(_ => timedOut = true), task.then(_ => waited = true)])
    if (timedOut) {
      this.waiting = true
      this.emitter.emit('startWaiting')
      await until(() => waited)
      this.waiting = false
      this.emitter.emit('stopWaiting')
    }
    const ret = await task
    if (ret.error) {
      this.emitter.emit('error', ret.error)
      throw new Error(ret.error)
    }
    return ret.data
  }

  private async internalWait(expectedAction: string): Promise<{data?: any, error?: string}> {
    if (!this.socket) {
      throw new Error("Socket is not open.")
    }

    let ret: any = undefined

    this.socket.addEventListener('message', (e) => {
      const message = JSON.parse(e.data)
      const action = message.action
      if (!action) {
        return
      }
      if (expectedAction === action) {
        if (message.error) {
          ret = { error: message.error }
        } else {
          ret = { data: message.data }
        }
      }
    })

    await until(() => ret !== undefined)
    return ret
  }
}
