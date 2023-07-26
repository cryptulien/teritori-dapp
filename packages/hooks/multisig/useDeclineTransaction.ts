import { useMutation } from "@tanstack/react-query";

import useSelectedWallet from "../useSelectedWallet";

export const useDeclineTransaction = () => {
  const { selectedWallet: walletAccount } = useSelectedWallet();

  // req
  const mutation = useMutation(
    async ({
      currentDecliners,
      transactionID,
      addDecliner,
    }: {
      currentDecliners: string[];
      transactionID: string;
      addDecliner: (address: string) => void;
    }) => {
      try {
        if (!walletAccount?.address) {
          return;
        }
        const hasAlreadyDeclined = currentDecliners.includes(
          walletAccount.address
        );

        if (!hasAlreadyDeclined) {
          await updateTransactionDecliners(transactionID, [
            ...currentDecliners,
            walletAccount.address,
          ]);

          addDecliner(walletAccount.address);
        }
      } catch (err: any) {
        console.error(err);
      }
    }
  );
  return mutation;
};
