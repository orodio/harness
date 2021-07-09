import { currentUser } from "@onflow/fcl";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { yup, nope } from "../util";

const toHexStr = str => {
  return Buffer.from(str).toString("hex");
};

export const LABEL = "User Sign";
export const CMD = async () => {
  const MSG = toHexStr("FOO");
  // prettier-ignore
  return currentUser()
    .signUserMessage(MSG)
    .then(yup("US-1"))
    .then(compSigs => fcl.currentUser().verifyUserSignatures(MSG, compSigs).then(console.log))
    .catch(nope("US-1"))
};
