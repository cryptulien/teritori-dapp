import React from "react";
import { Linking } from "react-native";

import { ConnectWalletButton } from "./components/ConnectWalletButton";
import adenaSVG from "../../../assets/icons/adena.svg";
import { useFeedbacks } from "../../context/FeedbacksProvider";
import { gnoTestnetNetwork } from "../../networks/gno-testnet";
import {
  setIsAdenaConnected,
  setSelectedNetworkId,
  setSelectedWalletId,
} from "../../store/slices/settings";
import { useAppDispatch } from "../../store/store";

export const ConnectAdenaButton: React.FC<{
  onDone?: (err?: unknown) => void;
}> = ({ onDone }) => {
  const { setToastError } = useFeedbacks();
  const dispatch = useAppDispatch();
  const handlePress = async () => {
    try {
      const adena = (window as any)?.adena;
      if (!adena) {
        Linking.openURL("https://adena.app/");
        return;
      }
      const establishResult = await adena.AddEstablish("Teritori dApp");
      console.log("established", establishResult);
      dispatch(setIsAdenaConnected(true));
      setSelectedNetworkId(gnoTestnetNetwork.id);
      dispatch(
        setSelectedWalletId(`adena-${(await adena.GetAccount()).data.address}`)
      );
      onDone && onDone();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setToastError({
          title: "Failed to connect Adena",
          message: err.message,
        });
      }
      onDone && onDone(err);
    }
  };
  return (
    <ConnectWalletButton
      text="Adena Wallet"
      icon={adenaSVG}
      iconSize={20}
      onPress={handlePress}
    />
  );
};
