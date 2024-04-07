export interface Interaction {
  type: InteractionType
  id: string
}

export enum InteractionType {
  Deck = 'deck',
  Poll = 'poll',
  Empty = 'empty'
}

export interface Deck extends Interaction {
  description: string
  actions: DeckAction[]
}

export interface DeckAction {
  id: string
  displayName: string
  backgroundColor: Color
  cooldown: number
}

export interface Poll extends Interaction {
  description: string
  options: PollOption[]
}

export interface PollOption {
  id: string
  displayName: string
  votes: number
}

export interface Color {
  r: number
  g: number
  b: number
  a: number
}
