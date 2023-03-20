import { Account } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { useMutation } from "@tanstack/react-query";
import { calculateFee } from "cosmwasm";
import moment from "moment";

import { useMultisigContext } from "../../context/MultisigReducer";
import {
  MultisigExecuteFormType,
  MultisigTransactionType,
} from "../../screens/Multisig/types";
import { createTransaction } from "../../utils/founaDB/multisig/multisigGraphql";
import { DbCreateTransaction } from "../../utils/founaDB/multisig/types";
import useSelectedWallet from "./../useSelectedWallet";

export const useCreateMultisigTransactionForExecuteContract = () => {
  // variables
  const { state } = useMultisigContext();

  const selectedWallet = useSelectedWallet();

  // req
  const mutation = useMutation(
    async ({
      formData: { multisigAddress, contractAddress, msg, multisigId, type },
      accountOnChain,
    }: {
      formData: MultisigExecuteFormType & {
        multisigId: string;
        type: MultisigTransactionType;
      };
      accountOnChain: Account | null;
    }) => {
      try {
        const msgSend = {
          sender: multisigAddress,
          contract: contractAddress,
          msg: JSON.stringify(msg),
          funds: [],
        };
        const cosmwasm_msg = {
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: msgSend,
        };
        const gasLimit = "200000";
        const gasPrice = "0.03utori";
        const fee = calculateFee(Number(gasLimit), gasPrice);

        assert(accountOnChain, "accountOnChain missing");

        const tx: DbCreateTransaction = {
          accountNumber: accountOnChain.accountNumber,
          sequence: accountOnChain.sequence,
          chainId: state.chain?.chainId || "",
          msgs: JSON.stringify([cosmwasm_msg]),
          fee: JSON.stringify(fee),
          memo: "",
          type,
          createdAt: moment().toISOString(),
          createdBy: selectedWallet?.address || "",
          recipientAddress: contractAddress,
        };
        const saveRes = await createTransaction(multisigId, tx);

        const transactionID = saveRes.data.data.createTransaction._id;

        return transactionID;
      } catch (err: any) {
        console.log(err);
      }
    }
  );
  return mutation;
};
