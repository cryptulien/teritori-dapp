import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  DbAccount,
  DbCreateTransaction,
  DbSignature,
  DbUserWallet,
} from "./types";
import { Exact } from "../../../api/multisig";

// Graphql base request for Faunadb
const graphqlReq = axios.create({
  baseURL: "https://graphql.eu.fauna.com/graphql",
  headers: {
    Authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
  },
});

export const fetcherConfig = {
  endpoint: "https://graphql.eu.fauna.com/graphql",
  fetchParams: {
    headers: {
      Authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
    },
  },
};

/**
 * Creates multisig record in faunadb
 *
 * @param {object} multisig an object with address (string), pubkey JSON and chainId
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createOrFindMultisig = async (multisig: DbAccount) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          createOrFindMultisig(
            address: ${JSON.stringify(multisig.address)},
            pubkeyJSON: ${JSON.stringify(multisig.pubkeyJSON)},
            chainId: ${JSON.stringify(multisig.chainId)},
            userAddresses: ${JSON.stringify(multisig.userAddresses)},
          ) {
            _id
            address
            pubkeyJSON
            chainId
            userAddresses
          }
        }
      `,
    },
  });
};

/**
 * Creates transaction record in faunadb
 *
 * @param {object} transaction The base transaction
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createTransaction = async (
  multisigId: string,
  transaction: DbCreateTransaction
) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          createTransaction(data: {
            accountNumber: ${transaction.accountNumber},
            sequence: ${transaction.sequence},
            chainId: "${transaction.chainId}",
            msgs: ${JSON.stringify(transaction.msgs)},
            fee: ${JSON.stringify(transaction.fee)},
            memo: "${transaction?.memo || ""}",
            multisig: {connect: ${multisigId}}, 
            type: "${transaction.type}",
            createdAt: "${transaction.createdAt}",
            createdBy: "${transaction.createdBy}"
            recipientAddress: "${transaction.recipientAddress}"
          }) {
            _id
          }
        }
      `,
    },
  });
};

/**
 * Retrieves all transaction from faunadb
 *
 * @param {string} multisigId Faunadb resource txHash
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const transactionsByMultisigId = async (
  multisigId: string,
  type: string,
  size: number,
  cursor: string | null
) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        query {
          transactionsByMultisigId(
            id: "${multisigId}"
            type: "${type}"
            _size: ${size}
            _cursor: ${cursor ? `"${cursor}"` : null}
          ) {
            data {
              _id
              accountNumber
              sequence
              chainId
              msgs
              fee
              memo
              recipientAddress
              txHash
              type
              createdAt
              createdBy
              decliners
              multisig {
                _id
                address
                pubkeyJSON
                userAddresses
              }
              signatures {
                data {
                  address
                  signature
                  bodyBytes
                }
              }
            }
            before
            after
          }
        }
      `,
    },
  });
};

/**
 * Retrieves all transaction from faunadb
 *
 * @param {string} userAddress Faunadb resource txHash
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const transactionsByUserAddress = async (
  userAddress: string,
  chainId: string,
  size: number
) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        query {
          transactionsByUserAddress(
            address: "${userAddress}"
            type: null
            chainId: "${chainId}"
            _size: ${size}
          ) {
            data {
              _id
              accountNumber
              sequence
              chainId
              msgs
              fee
              memo
              recipientAddress
              txHash
              type
              createdAt
              createdBy
              decliners
              multisig {
                _id
                address
                pubkeyJSON
                userAddresses
              }
              signatures {
                data {
                  address
                  signature
                  bodyBytes
                }
              }
            }
            after
          }
        }
      `,
    },
  });
};

export const faunaDbQuery = async <
  Hook extends {
    getKey: (vars: Exact<any>) => any;
    fetcher: (...args: any) => () => Promise<any>;
  }
>(
  hook: Hook,
  queryClient: QueryClient,
  variables: Hook extends { getKey: (vars: infer Variables) => any }
    ? Variables
    : unknown
): Promise<
  Hook extends { fetcher: (...args: any) => () => Promise<infer Return> }
    ? Return
    : unknown
> => {
  return await queryClient.fetchQuery(
    hook.getKey(variables),
    hook.fetcher(fetcherConfig, variables)
  );
};

/**
 * Retrieves all transaction from faunadb
 *
 * @param {string} multisigId Faunadb resource _id
 * @param {string[]} types Faunadb resource
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const getTransactionCountByMultisigId = async (
  multisigId: string,
  types: string[]
) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
      query {
        getTransactionCountByMultisigId(id:"${multisigId}", types: ${JSON.stringify(
        types
      )})
      }
      `,
    },
  });
};

/**
 * Updates txHash of transaction on FaunaDB
 *
 * @param {string} id Faunadb resource id
 * @param {string} txHash tx hash returned from broadcasting a tx
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const completeTransaction = async (
  id: string,
  txHash: string,
  updatedSequence: number
) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          completeTransaction(id: "${id}", txHash: "${txHash}", updatedSequence: ${updatedSequence}) {
            _id
            accountNumber
            sequence
            chainId
            msgs
            fee
            memo
            txHash
            signatures {
              data {
                address
                signature
                bodyBytes
              }
            }
          }
        }
      `,
    },
  });
};

/**
 * Updates txHash of transaction on FaunaDB
 *
 * @param {string} id Faunadb resource id
 * @param {string[]} decliners array of decliners address
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const updateTransactionDecliners = async (id: string, decliners: string[]) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          updateTransaction(id: ${id}, data: {decliners: ${JSON.stringify(
        decliners
      )}}) {
            _id
            decliners
          }
        }
      `,
    },
  });
};

/**
 * Creates signature record in faunadb
 *
 * @param {object} signature an object with bodyBytes (string) and signature set (Uint8 Array)
 * @param {string} transactionId id of the transaction to relate the signature with
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createSignature = async (
  signature: DbSignature,
  transactionId: string
) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          createSignature(data: {
            transaction: {connect: ${transactionId}}, 
            bodyBytes: "${signature.bodyBytes}",
            signature: "${signature.signature}",
            address: "${signature.address}" 
          }) {
            _id
            address
            signature
            address
          }

        }
      `,
    },
  });
};

const createUserWallet = async (
  userWallet: DbUserWallet,
  multisigId: string
) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          createUserWallet(data: {
            walletName: "${userWallet.walletName}",
            chainId: "${userWallet.chainId}",
            userAddress: "${userWallet.userAddress}",
            multisig: {connect:"${multisigId}"}            
          }) {            
            walletName
            userAddress
          }
        }
      `,
    },
  });
};

export {
  createOrFindMultisig,
  createTransaction,
  completeTransaction,
  createSignature,
  transactionsByMultisigId,
  getTransactionCountByMultisigId,
  transactionsByUserAddress,
  updateTransactionDecliners,
  createUserWallet,
};
