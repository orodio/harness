import * as fcl from "@onflow/fcl"

const USE_LOCAL = false

// prettier-ignore
fcl.config()
  .put("app.detail.title", "Test Harness")
  .put("app.detail.icon", "https://placekitten.com/g/200/200")
  .put("service.OpenID.scopes", "email")

if (USE_LOCAL) {
  // prettier-ignore
  fcl.config()
    .put("env", "local")
    .put("accessNode.api", "http://localhost:8080")
    .put("discovery.wallet", "http://localhost:8701/fcl/authn")
    .put("discovery.wallet.method", "frame")
} else {
  // prettier-ignore
  fcl.config()
    .put("env", "testnet")
    .put("accessNode.api", "https://access-testnet.onflow.org")
    .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
    // .put("accessNode.api", "https://access-mainnet-beta.onflow.org")
    // .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
    .put("discovery.wallet.method", "frame")
}
