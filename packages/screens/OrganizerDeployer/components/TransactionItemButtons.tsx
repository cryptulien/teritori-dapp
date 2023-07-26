import React, { FC, useEffect, useMemo } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import { ProposalTransactionItemProps } from "./ProposalTransactionItem";
import { BrandText } from "../../../components/BrandText";
import { AnimationFadeIn } from "../../../components/animations";
import { SecondaryButton } from "../../../components/buttons/SecondaryButton";
import { SecondaryButtonOutline } from "../../../components/buttons/SecondaryButtonOutline";
import { MainConnectWalletButton } from "../../../components/connectWallet/MainConnectWalletButton";
import { SpacerRow } from "../../../components/spacer";
import {
  useApproveTransaction,
  useBroadcastTransaction,
  useDeclineTransaction,
} from "../../../hooks/multisig";
import { useSelectedNetworkId } from "../../../hooks/useSelectedNetwork";
import useSelectedWallet from "../../../hooks/useSelectedWallet";
import { txExplorerLink } from "../../../networks";
import {
  errorColor,
  neutral00,
  neutral77,
  primaryColor,
  secondaryColor,
  successColor,
} from "../../../utils/style/colors";
import { fontMedium14, fontSemibold9 } from "../../../utils/style/fonts";
import { layout } from "../../../utils/style/layout";
import { tinyAddress } from "../../../utils/text";

interface TransactionItemButtonsProps extends ProposalTransactionItemProps {
  currentDecliners: string[];
  addSignature: (signature: unknown) => void;
  addDecliner: (address: string) => void;
  isCompletelyDeclined: boolean;
}

export const TransactionItemButtons: React.FC<TransactionItemButtonsProps> = ({
  btnSquaresBackgroundColor,
  currentDecliners,
  signatures,
  addSignature,
  addDecliner,
  chainId,
  multisigPubkeyJson,
  id,
  finalHash: txHash,
  isCompletelyDeclined,
  isUserMultisig,
  multisigAddress,
  threshold,
  fee,
  accountNumber,
  msgs,
  sequence,
  memo,
  shouldRetch,
}) => {
  const { selectedWallet: wallet } = useSelectedWallet();
  const selectedNetworkId = useSelectedNetworkId();
  const { mutate: approve } = useApproveTransaction();
  const { mutate: decline, isLoading: isDeclining } = useDeclineTransaction();
  const {
    mutate: broadcast,
    isLoading: isBroacasting,
    data: resTxHash,
  } = useBroadcastTransaction();

  const hasSigned = useMemo(
    () => signatures?.some((sig) => sig.userAddress === wallet?.address),
    [signatures, wallet?.address]
  );

  const hasDeclined = useMemo(
    () =>
      currentDecliners?.some((address) => address === wallet?.address) ||
      isCompletelyDeclined,
    [currentDecliners, isCompletelyDeclined, wallet?.address]
  );

  const isCompletedSignature = signatures.length >= threshold;

  // hooks
  useEffect(() => {
    if (resTxHash) {
      shouldRetch && shouldRetch();
    }
  }, [resTxHash, shouldRetch]);

  // functions
  const onApprove = async () => {
    approve({
      tx: {
        chainId,
        multisigAddress,
        fee,
        accountNumber,
        msgs,
        sequence,
        memo,
      },
      currentSignatures: signatures,
      transactionId: id,
    });
  };

  const onDecline = async () =>
    decline({
      currentDecliners,
      transactionID: "TODO",
      addDecliner,
    });

  const onBroadcast = () =>
    broadcast({
      tx: {
        fee,
        sequence,
        chainId,
        multisigAddress,
      },
      currentSignatures: signatures,
      pubkey: JSON.parse(multisigPubkeyJson),
      transactionId: id,
    });

  // returns
  if (wallet?.address === undefined) {
    return <MainConnectWalletButton size="M" />;
  }

  if (isUserMultisig === undefined) {
    return (
      <AnimationFadeIn style={styles.container}>
        <ActivityIndicator color={secondaryColor} />
      </AnimationFadeIn>
    );
  }

  if (
    (hasDeclined && !isCompletedSignature) ||
    (hasSigned && !isCompletedSignature) ||
    txHash ||
    resTxHash
  ) {
    const color = (() => {
      if (txHash || resTxHash) return successColor;
      if (hasDeclined) return errorColor;
      if (hasSigned) return primaryColor;
    })();

    const resultText = (() => {
      if (txHash || resTxHash) return "EXECUTED";
      if (hasDeclined) return "DECLINED";
      if (hasSigned) return "APPROVED";
    })();

    const Result: FC = () => (
      <View style={styles.resultContainer}>
        <BrandText style={[styles.resultText, { color }]}>
          {resultText}
        </BrandText>
      </View>
    );

    return (
      <AnimationFadeIn style={styles.container}>
        {txHash || resTxHash ? (
          <Pressable
            onPress={() =>
              Linking.openURL(
                txExplorerLink(selectedNetworkId, txHash || resTxHash || "")
              )
            }
          >
            <Result />
            <BrandText style={styles.txHashText}>
              {tinyAddress(txHash || resTxHash, 14)}
            </BrandText>
          </Pressable>
        ) : (
          <Result />
        )}
      </AnimationFadeIn>
    );
  }

  if (isCompletedSignature) {
    return (
      <AnimationFadeIn style={styles.container}>
        <SecondaryButtonOutline
          text="Broadcast"
          size="M"
          squaresBackgroundColor={btnSquaresBackgroundColor}
          color={successColor}
          borderColor={successColor}
          isLoading={isBroacasting}
          onPress={onBroadcast}
        />
      </AnimationFadeIn>
    );
  }

  return (
    <AnimationFadeIn style={styles.container}>
      <SecondaryButton
        text="Approve"
        size="M"
        squaresBackgroundColor={btnSquaresBackgroundColor}
        loader
        onPress={onApprove}
      />
      <SpacerRow size={2} />
      <SecondaryButtonOutline
        text="Decline"
        size="M"
        squaresBackgroundColor={btnSquaresBackgroundColor}
        color={errorColor}
        borderColor={errorColor}
        backgroundColor={neutral00}
        onPress={onDecline}
        autoLoader
        isLoading={isDeclining}
      />
    </AnimationFadeIn>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  resultContainer: {
    width: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  resultText: StyleSheet.flatten([
    fontMedium14,
    { textTransform: "uppercase" },
  ]),
  txHashText: StyleSheet.flatten([
    fontSemibold9,
    {
      marginTop: layout.padding_x0_25,
      color: neutral77,
      flexWrap: "wrap",
      width: "100%",
      textAlign: "center",
    },
  ]),
});
