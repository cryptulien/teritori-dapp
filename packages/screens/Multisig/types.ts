export type CreateMultisigWalletFormType = {
  addresses: { address: string }[];
  signatureRequired: string;
  maxSignature: string;
};

export type MultisigLegacyFormType = {
  receiptAddress: string;
  membersAddress: { address: string }[];
  assets: string;
};

export type MultisigTransactionDelegateFormType = {
  multisigAddress: string;
  membersAddress: { address: string }[];

  receipientAddress: string;
  amount: string;
  gasLimit: string;
  gasPrice: string;
  memo: string;
};
