import { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'

window.fcl = fcl
window.t = t

window.addEventListener('FLOW::TX', d => {
  console.log('FLOW::TX', d.detail.delta, d.detail.txId)
  fcl
    .tx(d.detail.txId)
    .subscribe(txStatus => console.log('TX:STATUS', d.detail.txId, txStatus))
})

window.addEventListener('message', d => {
  console.log('Harness Message Received', d.data)
})

// prettier-ignore
fcl.config()
  .put("app.detail.title", "Test Harness")
  .put("app.detail.icon", "https://i.imgur.com/r23Zhvu.png")
  .put("service.OpenID.scopes", "email email_verified name zoneinfo")

if (true) {
  // prettier-ignore
  fcl.config()
    .put("env", "local")
    .put("accessNode.api", "http://localhost:8080")
    .put("discovery.wallet", "http://localhost:3000/fcl/authn")
    .put("challenge.handshake", "http://localhost:3000/fcl/authn")
} else {
  // prettier-ignore
  fcl.config()
    .put("env", "testnet")
    .put("accessNode.api", "https://access-testnet.onflow.org")
}

const script = async () => {
  return fcl
    .send([
      fcl.script`
      pub fun main(a: Int, b: Int): Int {
        return a + b
      }
    `,
      fcl.args([fcl.arg(7, t.Int), fcl.arg(9, t.Int)]),
    ])
    .then(fcl.decode)
    .then(d => console.log('SX', d))
}

const tx = async () => {
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
    .then(d => console.log('TX', d))
    .catch(err => console.error('Oh No!! --', err))
}

const validateSignature = async (cs, message) => {
  return fcl
    .send([
      fcl.script`
      import Crypto

      pub fun main(
        message: String,
        signatures: [String],
        rawPublicKeys: [String],
        weights: [UFix64],
      ): Bool {
        
        let keyList = Crypto.KeyList()

        var i = 0
        for rawPublicKey in rawPublicKeys {
          keyList.add(
            PublicKey(
              publicKey: rawPublicKey.decodeHex(),
              signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
            ),
            hashAlgorithm: HashAlgorithm.SHA3_256,
            weight: weights[i],
          )
          i = i + 1
        }

        let signatureSet: [Crypto.KeyListSignature] = []
        var j = 0
        for signature in signatures {
          signatureSet.append(
            Crypto.KeyListSignature(
              keyIndex: j,
              signature: signature.decodeHex()
            )
          )
          j = j + 1
        }
        
        let signedData = message.decodeHex()
        return keyList.isValid(
          signatureSet: signatureSet,
          signedData: signedData,
        )
      }
    `,
      fcl.args([
        fcl.arg(message, t.String),
        fcl.arg([cs.signature], t.Array([t.String])),
        fcl.arg(
          [`${process.env.REACT_APP_FLOW_ACCOUNT_PUBLIC_KEY}`],
          t.Array([t.String])
        ),
        fcl.arg(['1.0'], t.Array([t.UFix64])),
      ]),
    ])
    .then(fcl.decode)
    .then(d => {
      console.log('signature validated', d)
      d ? showSuccessToast() : alert('Unable to validate signature')
    })
}

const signUserMessage = async () => {
  // "foo", encoded as UTF-8, in hex representation '666f6f'
  const message = Buffer.from('foo').toString('hex')
  let signature
  try {
    signature = await fcl.currentUser().signUserMessage(message)
  } catch (error) {
    console.log(error)
  }
  signature
    ? validateSignature(signature, message)
    : console.log('User declined to sign')
}

const showSuccessToast = () => {
  var el = document.getElementById('snackbar')
  el.className = 'show'
  setTimeout(() => {
    el.className = el.className.replace('show', '')
  }, 3000)
}

const BTNS = [
  ['Log In', fcl.reauthenticate],
  ['Log Out', fcl.unauthenticate],
  ['Script', script],
  ['Tx', tx],
  ['Sign', signUserMessage],
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
      <pre>{JSON.stringify({ currentUser, config }, null, 2)}</pre>
      <div id='snackbar'>Successfully signed the message</div>
    </div>
  )
}
