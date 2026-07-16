const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market'
const PING_INTERVAL_MS = 10_000

export interface TradeEvent {
  id: string
  assetId: string
  side: 'BUY' | 'SELL'
  price: number
  size: number
  usdValue: number
  timestamp: number
  outcome: 'UP' | 'DOWN' | null
}

export interface BookEvent {
  assetId: string
  bids: { price: string; size: string }[]
  asks: { price: string; size: string }[]
}

export interface PriceChangeEvent {
  assetId: string
  price: number
  size: number
  side: 'BUY' | 'SELL'
}

type MarketWsHandlers = {
  onBook?: (event: BookEvent) => void
  onPriceChange?: (event: PriceChangeEvent) => void
  onTrade?: (event: TradeEvent) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

function parseMessage(raw: MessageEvent['data']): unknown {
  if (typeof raw !== 'string') return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export class MarketWsClient {
  private ws: WebSocket | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private assetIds: string[] = []
  private tokenOutcome = new Map<string, 'UP' | 'DOWN'>()
  private handlers: MarketWsHandlers = {}
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private shouldRun = false

  setHandlers(handlers: MarketWsHandlers) {
    this.handlers = handlers
  }

  setTokenOutcomes(upTokenId: string, downTokenId: string) {
    this.tokenOutcome.clear()
    this.tokenOutcome.set(upTokenId, 'UP')
    this.tokenOutcome.set(downTokenId, 'DOWN')
  }

  connect(assetIds: string[]) {
    this.assetIds = assetIds
    this.shouldRun = true
    this.open()
  }

  disconnect() {
    this.shouldRun = false
    this.clearPing()
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
  }

  private open() {
    if (!this.shouldRun) return
    this.ws = new WebSocket(WS_URL)

    this.ws.onopen = () => {
      this.ws?.send(
        JSON.stringify({
          assets_ids: this.assetIds,
          type: 'market',
          custom_feature_enabled: true,
        })
      )
      this.startPing()
      this.handlers.onConnect?.()
    }

    this.ws.onmessage = (msg) => this.handleMessage(msg)

    this.ws.onclose = () => {
      this.clearPing()
      this.handlers.onDisconnect?.()
      if (this.shouldRun) {
        this.reconnectTimer = setTimeout(() => this.open(), 2000)
      }
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private startPing() {
    this.clearPing()
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('PING')
      }
    }, PING_INTERVAL_MS)
  }

  private clearPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private handleMessage(msg: MessageEvent) {
    const data = parseMessage(msg.data)
    if (!data || typeof data !== 'object') return

    const payload = data as Record<string, unknown>
    const eventType = payload.event_type as string | undefined

    if (eventType === 'book') {
      const assetId = String(payload.asset_id ?? '')
      const bids = (payload.bids as BookEvent['bids']) ?? []
      const asks = (payload.asks as BookEvent['asks']) ?? []
      this.handlers.onBook?.({ assetId, bids, asks })
      return
    }

    if (eventType === 'price_change') {
      const changes = (payload.price_changes as Record<string, unknown>[]) ?? []
      for (const change of changes) {
        const assetId = String(change.asset_id ?? '')
        const price = parseFloat(String(change.price ?? '0'))
        const size = parseFloat(String(change.size ?? '0'))
        const side = String(change.side ?? 'BUY').toUpperCase() as 'BUY' | 'SELL'
        this.handlers.onPriceChange?.({ assetId, price, size, side })
      }
      return
    }

    if (eventType === 'last_trade_price') {
      const assetId = String(payload.asset_id ?? '')
      const price = parseFloat(String(payload.price ?? '0'))
      const size = parseFloat(String(payload.size ?? '0'))
      const side = String(payload.side ?? 'BUY').toUpperCase() as 'BUY' | 'SELL'
      const ts = parseInt(String(payload.timestamp ?? Date.now()), 10)

      this.handlers.onTrade?.({
        id: `${assetId}-${ts}-${price}-${size}`,
        assetId,
        side,
        price,
        size,
        usdValue: price * size,
        timestamp: ts,
        outcome: this.tokenOutcome.get(assetId) ?? null,
      })
    }
  }
}
