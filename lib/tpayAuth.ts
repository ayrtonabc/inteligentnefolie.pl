class TPayAuthService {
  constructor(clientId, clientSecret, isSandbox = false) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.baseUrl = isSandbox 
      ? 'https://openapi.sandbox.tpay.com' 
      : 'https://api.tpay.com'
    this.token = null
    this.tokenExpiry = null
  }

  async getAccessToken() {
    if (this.token && this.tokenExpiry > Date.now() + 300000) {
      return this.token
    }

    const response = await fetch(`${this.baseUrl}/oauth/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    })

    if (!response.ok) throw new Error('TPay auth failed')

    const data = await response.json()
    this.token = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000)

    return this.token
  }

  async request(endpoint, options = {}) {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`TPay API error: ${error.message || response.statusText}`)
    }

    return response.json()
  }
}

export default TPayAuthService