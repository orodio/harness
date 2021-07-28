import { currentUser } from "@onflow/fcl"
import * as fcl from "@onflow/fcl"
import { yup, nope } from "../util"

const toHexStr = str => {
  return Buffer.from(str).toString("hex")
}

export const LABEL = "User Sign & Verify"
export const CMD = async () => {
  const MSG = toHexStr("FOO")
  // prettier-ignore
  const res = await currentUser()
    .signUserMessage(MSG)
    .then(yup("US-1"))
    .then(res => res)
    .catch(nope("US-1"))

  if (typeof res === "string") return

  return await fcl
    .currentUser()
    .verifyUserSignatures(MSG, res)
    .then(console.log)
}
