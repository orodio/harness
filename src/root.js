import {useState, useEffect} from "react"
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

// prettier-ignore
fcl.config()
  .put("app.detail.title", "Test Harness")
  // .put("app.detail.icon", "https://i.imgur.com/r23Zhvu.png")
  .put("app.detail.icon", "https://placekitten.com/g/200/200")
  .put("service.OpenID.scopes", "email")

if (false) {
  // prettier-ignore
  fcl.config()
    .put("env", "local")
    .put("accessNode.api", "http://localhost:8080")
    .put("discovery.wallet", "http://localhost:3000/fcl/authn")
} else {
  // prettier-ignore
  fcl.config()
    .put("env", "testnet")
    .put("accessNode.api", "https://access-testnet.onflow.org")
    .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
}

const yup = tag => d => (console.log(`${tag}`, d), d)
const nope = tag => d => (console.error(`Oh No!! [${tag}]`, d), d)

const Q1 = async () => {
  // prettier-ignore
  return fcl.query({
    cadence: `
      pub fun main(): Int {
        return 7
      }
    `,
  }).then(yup("Q-1"))
    .catch(nope("Q-1"))
}

const Q2 = async () => {
  // prettier-ignore
  return fcl.query({
    cadence: `
      pub fun main(a: Int, b: Int): Int {
        return a + b
      }
    `,
    args: (arg, t) => [
      arg(5, t.Int),
      arg(7, t.Int),
    ],
  }).then(yup("Q-2"))
    .catch(nope("Q-2"))
}

const script = async () => {
  // prettier-ignore
  return fcl.send([
    fcl.script`
      pub fun main(a: Int, b: Int): Int {
        return a + b
      }
    `,
    fcl.args([fcl.arg(7, t.Int), fcl.arg(9, t.Int)]),
  ]).then(fcl.decode)
    .then(yup("SX-1"))
    .catch(nope("SX-1"))
}

const tx1 = async () => {
  return fcl
    .send([
      fcl.transaction`
      transaction(a: Int, b: Int) {
        prepare(acct: AuthAccount) {
          log(a + b)
          log(acct.address)
        }
      }
    `,
      fcl.args([fcl.arg(5, t.Int), fcl.arg(9, t.Int)]),
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(15),
    ])
    .then(fcl.decode)
    .then(yup("TX-1"))
    .catch(nope("TX-1"))
}

const M1 = async () => {
  // prettier-ignore
  return fcl.mutate({
    cadence: `
      transaction() {
        prepare(acct: AuthAccount) {
          log(acct)
        }
      }
    `,
    limit: 50,
  }).then(yup("M-1"))
    .catch(nope("M-1"))
}

const M2 = async () => {
  // prettier-ignore
  return fcl.mutate({
    cadence: `
      transaction(a: Int, b: Int, c: Address) {
        prepare(acct: AuthAccount) {
          log(acct)
          log(a)
          log(b)
          log(c)
        }
      }
    `,
    args: (arg, t) => [
      arg(6, t.Int),
      arg(7, t.Int),
      arg("0xba1132bc08f82fe2", t.Address),
    ],
    limit: 50,
  }).then(yup("M-2"))
    .catch(nope("M-2"))
}

const BTNS = [
  ["Log In", fcl.reauthenticate],
  ["Log Out", fcl.unauthenticate],
  ["Query-1 (no args)", Q1],
  ["Query-2 (args)", Q2],
  ["Script", script],
  ["Tx-1", tx1],
  ["Mutation-1", M1],
  ["Mutation-2", M2],
]

export default function Root() {
  const [currentUser, setCurrentUser] = useState(null)
  useEffect(() => fcl.currentUser().subscribe(setCurrentUser), [])
  const [config, setConfig] = useState(null)
  useEffect(() => fcl.config().subscribe(setConfig), [])

  return (
    <div>
      <ul>
        {BTNS.map(([label, onClick], i) => (
          <li key={i}>
            <button onClick={onClick}>{label}</button>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify({currentUser, config}, null, 2)}</pre>
    </div>
  )
}

// fcl
//   .config()
//   .put("0xMarket", "0x123546789")
//   .put("0xDUC", "0x123425678908765")
//   .put("0xNonFungibleToken", "0x12345678432")

// const buyNftAsCurrentUser = async (listingAddress, itemId) => {
//   // grab linked flow address for genies account (link account if not already linked)
//   const linkedAccountAddress = await getLinkedAccountAddress()
//   const fclUser = await fcl.authenticate()

//   if (fcl.withPrefix(linkedAccountAddress) !== fcl.withPrefix(fclUser.addr)) {
//     fcl.unauthenticate()
//     throw new Error("Account did not match linked account")
//   }

//   const txId = await fcl.mutate({
//     cadence: `
//       import Market from 0xMarket
//       import DUC from 0xDUC
//       import NonFungibleToken from 0xNonFungibleToken

//       transaction(itemID: UInt64, nftFrom: Address, nftTo: Address) {
//         prepare(moneyFrom: AuthAccount) {
//             // get listings
//             let listings = getAccount(nftFrom)
//               .getCapability<&{Market.CollectionPublic}>(Market.CollectionPublicPath)
//               .borrow()
//               .marketCollection

//             // get listing price
//             let price = listings.borrowSaleItem(itemID: itemID)!.price

//             // get money
//             let money <- moneyFrom
//               .borrow<&DUC.Vault>(from: DUC.StoragePath)
//               .withdraw(amount: price)

//             // where nft is sent
//             let receiver = getAccount(nftTo)
//               .getCapability<&{NonFungibleToken.Receiver}>(from: Items.CollectionReceiver)
//               .borrow()

//             // execute
//             listings.purchase(
//               itemID: itemID,
//               buyerCollection: receiver,
//               buyerPayment: <- money
//             )
//         }
//       }
//     `,

//     args: (arg, t) => [
//       arg(itemId, t.UInt64),
//       arg(listingAddress, t.Address),
//       arg(linkedFlowAccount, t.Address),
//     ],
//   })
// }
