import { Transaction, TransactionArgument } from '@mysten/sui/transactions'
import { fullFunctionName } from '~~/helpers/network'
import { PureTypeName } from '@mysten/sui/bcs'
import { useCurrentAccount } from '@mysten/dapp-kit';

// const currentAccount = useCurrentAccount()

// const signer = currentAccount?.address;


export const prepareCreateGreetingTransaction = (
  packageId: string
): Transaction => {
  const tx = new Transaction()
  tx.moveCall({
    arguments: [],
    target: fullFunctionName(packageId, 'create'),
  })

  tx.setGasBudget(1000000)

  return tx
}

export const prepareSetGreetingTransaction = (
  packageId: string,
  objectId: string,
  name: string
): Transaction => {
  const tx = new Transaction()
  tx.moveCall({
    arguments: [tx.object(objectId), tx.pure.string(name), tx.object('0x8')],
    target: fullFunctionName(packageId, 'set_greeting'),
  })

  tx.setGasBudget(1000000)

  return tx
}

export const prepareResetGreetingTransaction = (
  packageId: string,
  objectId: string
): Transaction => {
  const tx = new Transaction()
  tx.moveCall({
    arguments: [tx.object(objectId)],
    target: fullFunctionName(packageId, 'reset_greeting'),
  })

  tx.setGasBudget(1000000)

  return tx
}



export function prepareCreatePatentTransaction(
  packageId: string,
  hashedCode: string,
  data: string,
  name: string,
  description: string,
  date: string,
) {

  console.log("arguments ffor pattent ttrransact", {
    hashedCode,
    data
  })
  const tx = new Transaction()

  // const arg1 = "a" as TransactionArgument;
  // const arg2 = tx.pure("b", "string") as TransactionArgument;

  const argA = tx.pure("string", "a") as unknown as TransactionArgument;
  const argB = tx.pure("string", "b") as unknown as TransactionArgument;

  // const arg1: TransactionArgument = tx.pure("string", "a");
  // const arg2: TransactionArgument = tx.pure("string", "b");

  tx.moveCall({
    target: fullFunctionName(packageId, 'create_patent'),
    arguments: [
      // tx.pure.string(hashedCode),
      // tx.pure.string(data),
      // tx.pure.string(hashedCode),
      tx.pure.string(data),
      // argA,
      // argB,
      tx.pure.vector("string", ["a", "b", "c"]),
      // tx.pure(hashedCode), 
      // tx.pure(hashedDataArr),
      // tx.pure(Array.from(hashedCode)),
      // tx.pure(Array.from(data)),
      // tx.pure(hashedCode.buffer), 
      // tx.pure(data.buffer),
    ],
  })

  tx.setGasBudget(1000000)

  return tx
}


export function prepareSellPatentTransaction(packageId: string, patentObjectId: string, recipientAddress: string) {
  const tx = new Transaction();

  // The 'sell_patent' entry function expects the Patent object and recipient address.
  tx.moveCall({
    target: `${packageId}::patent::sell_patent`,
    arguments: [
      tx.object(patentObjectId), // the Patent object to transfer
      tx.pure.address(recipientAddress), // recipient address
    ],
  });


  tx.setGasBudget(1000000000)


  return tx;
}


export function prepareCreateAgreementTransaction(
  packageId: string,
  mediaHash: Uint8Array,
  metadataHash: Uint8Array,
  signatories: string[]
) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::agreement::create_agreement`,
    arguments: [
      tx.pure(mediaHash),
      tx.pure(metadataHash),
      // tx.pure(signatories),
      // tx.pure()
    ],
  });

  tx.setGasBudget(1000000)

  return tx;
}

export function prepareSignAgreementTransaction(packageId: string, objectId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::agreement::sign_agreement`,
    // arguments: [tx.object(objectId), tx.pure(signer)],
    arguments: [tx.object(objectId)],
  });

  tx.setGasBudget(1000000)


  return tx;
}

export function prepareProposeEditTransaction(
  packageId: string,
  objectId: string,
  newMetadataHash: Uint8Array
) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::agreement::propose_edit`,
    // arguments: [tx.object(objectId), tx.pure("proposer"), tx.pure(newMetadataHash)],
    arguments: [tx.object(objectId), tx.pure(newMetadataHash)],
  });

  tx.setGasBudget(1000000)


  return tx;
}

export function prepareSignEditTransaction(packageId: string, objectId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::agreement::sign_edit`,
    // arguments: [tx.object(objectId), tx.pure("signer")],
    arguments: [tx.object(objectId)],
  });

  tx.setGasBudget(1000000)


  return tx;
}



/**
 * Prepares a transaction to create a new Agreement object.
 * 
 * @param packageId Deployed Move package ID
 * @param mediaHash Encrypted media hash (e.g., Cloudinary URL)
 * @param metadataHash Encrypted metadata (JSON)
 * @param signatories Encrypted vector<string> of signers
 * @param expiry Expiry timestamp string
 */

// export function prepareCreateAgreementTx(
//   packageId: string,
//   mediaHash: string,
//   metadataHash: string,
//   signatories: string[],
//   expiry: string
// ): Transaction {
//   const tx = new Transaction();

//   tx.moveCall({
//     target: `${packageId}::agreement::create_agreement`,
//     arguments: [
//       tx.pure.string(mediaHash),
//       tx.pure.string(metadataHash),
//       // tx.pure(signatories, "vector<address>"),
//       // tx.pure(signatories.map((addr) => tx.pure(addr, 'address'))),
//       tx.pure.string(expiry),
//     ],
//   });

//   tx.setGasBudget(1000000)

//   return tx;
// }

export function prepareCreateAgreementTx(
  packageId: string,
  mediaHash: string,
  metadataHash: string,
  encryptedSignatory1: string,
  encryptedSignatory2: string,
  expiry: string
): Transaction {

  console.log("results before agreemen creation", {
    packageId,
    mediaHash,
    metadataHash,
    encryptedSignatory1,
    encryptedSignatory2,
    expiry
  })
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::agreement::create_agreement`,
    arguments: [
      tx.pure.string(mediaHash),
      tx.pure.string(metadataHash),
      tx.pure.address(encryptedSignatory1),
      tx.pure.address(encryptedSignatory2),
      tx.pure.string(expiry),
    ],
  });

  tx.setGasBudget(10000000000);

  return tx;
}
