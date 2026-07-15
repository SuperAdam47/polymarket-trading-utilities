const wallet = '0x661d589424bc21a094ad4849063a9e375c141d3e'

async function main() {
  for (const type of ['DEPOSIT', 'WITHDRAWAL']) {
    const r = await fetch(
      `https://data-api.polymarket.com/activity?user=${wallet}&type=${type}&limit=5`
    )
    const j = await r.json()
    console.log('\n===', type, '===')
    console.log('count', Array.isArray(j) ? j.length : j)
    if (Array.isArray(j) && j[0]) console.log(JSON.stringify(j[0], null, 2))
  }

  const all = await fetch(
    `https://data-api.polymarket.com/activity?user=${wallet}&limit=500`
  ).then((r) => r.json())
  const types = {}
  for (const a of all) types[a.type] = (types[a.type] || 0) + 1
  console.log('\n=== all activity types (limit 500) ===', types)

  const profile = await fetch(
    `https://gamma-api.polymarket.com/public-profile?address=${wallet}`
  ).then((r) => r.json())
  console.log('\n=== profile proxyWallet ===', profile?.proxyWallet)

  const bridgeEndpoints = [
    `https://bridge.polymarket.com/status/${wallet}`,
    `https://bridge.polymarket.com/deposit/${wallet}`,
  ]
  for (const url of bridgeEndpoints) {
    try {
      const r = await fetch(url)
      const text = await r.text()
      console.log('\n===', url, r.status, '===')
      console.log(text.slice(0, 500))
    } catch (e) {
      console.log('err', url, e.message)
    }
  }
}

main().catch(console.error)
