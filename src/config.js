import * as fcl from "@onflow/fcl"

const USE_LOCAL = true

// prettier-ignore
fcl.config()
  .put("app.detail.title", "Test Harness")
  // .put("app.detail.icon", "https://i.imgur.com/r23Zhvu.png")
  .put("app.detail.icon", "https://placekitten.com/g/200/200")
  .put("service.OpenID.scopes", "email")
// .put("serviceStrategy", "frame")

if (USE_LOCAL) {
  // prettier-ignore
  fcl.config()
    .put("env", "local")
    .put("accessNode.api", "http://localhost:8080")
    .put("challenge.handshake", "http://localhost:8701/fcl/authn")
    .put("discovery.wallet.view", "frame")
} else {
  // prettier-ignore
  fcl.config()
    .put("env", "testnet")
    .put("accessNode.api", "https://access-testnet.onflow.org")
    .put("challenge.handshake", "https://fcl-discovery.onflow.org/testnet/authn")
    .put("discovery.wallet.view", "frame")
}
