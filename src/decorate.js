import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

window.fcl = fcl
window.t = t

window.addEventListener("FLOW::TX", d => {
  console.log("FLOW::TX", d.detail.delta, d.detail.txId)
  fcl
    .tx(d.detail.txId)
    .subscribe(txStatus => console.log("TX:STATUS", d.detail.txId, txStatus))
})

window.addEventListener("message", d => {
  console.log("Harness Message Received", d.data)
})
