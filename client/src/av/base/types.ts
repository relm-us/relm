export type TrackKind = "audio" | "video" | "data"
export type Track = MediaStreamTrack | SimplifiedTrack

export type AVParticipant = {
  id: string
  isDominant: boolean
  connectionScore: number // 0 to 1
}

export type AVResource = {
  id: string
  participantId: string
  kind: TrackKind
  paused: boolean
  track: Track
}

export type ConnectStatus =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected" }
  | { status: "error"; error: Error }

export type ConnectOptions = {
  displayName?: string
  produceAudio?: boolean
  produceVideo?: boolean
}

/** Define TrackStore type, which fulfills the 'writable' Svelte store contract */
type Subscriber<T> = (value: T) => void
type Unsubscriber = () => void
type Updater<T> = (value: T) => T
type Invalidator<T> = (value?: T) => void
interface Readable<T> {
  subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber
}
interface Writable<T> extends Readable<T> {
  set(this: void, value: T): void
  update(this: void, updater: Updater<T>): void
}

export interface SimplifiedTrack {
  kind: TrackKind

  attach?(element?: HTMLMediaElement | string): HTMLMediaElement
  detach?(element?: HTMLMediaElement | string): HTMLMediaElement[]
}

export type TrackStore = Writable<Track>

export type BandwidthEstimate = {
  desired: number
  actual: number
}
