import React, { memo, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { BrandText } from "../../components/BrandText";
import { nftDropedAdjustmentType } from "../../screens/RiotersFooter/RiotersFooterScreen.types";
import {
  neutral33,
  neutral44,
  neutral77,
  primaryColor,
  errorColor,
} from "../../utils/style/colors";
import Slider from "../Slider";
import { IconButton } from "../buttons/IconButton";
import { PrimaryButton } from "../buttons/PrimaryButton";
import CollectionItem from "./CollectionItem";

const NftAdjustments: React.FC<{
  nftCollectionId: string;
  newNftCollections: any[];
  nftDroped: any;
  setNftDroped: (nftDroped: any) => void;
  nftDropedAdjustment: nftDropedAdjustmentType;
  setNftDropedAdjustment: (
    nftDropedAdjustment: nftDropedAdjustmentType
  ) => void;
  price: number;
  setPrice: (price: number) => void;
}> = memo(
  ({
    nftCollectionId,
    newNftCollections,
    nftDroped,
    setNftDroped,
    nftDropedAdjustment,
    setNftDropedAdjustment,
    price,
    setPrice,
  }) => {
    const [sliderValue, setSliderValue] = useState(0);
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
      setNftDropedAdjustment({
        ...nftDropedAdjustment,
        borderRadius: percentage,
      });
    }, [percentage]);

    useEffect(() => {
      setPercentage((Math.round((sliderValue * 100) / 220) * 2) / 2);
    }, [sliderValue]);

    const currentCollection = newNftCollections.find(
      (collection) => collection.id === nftCollectionId
    );

    return (
      <View style={styles.container}>
        <BrandText style={styles.textTitle}>NFT info & adjustments</BrandText>
        <View style={styles.separator} />
        <View>
          <BrandText style={styles.textTitle}>Collection</BrandText>
          <CollectionItem collection={currentCollection} />
        </View>
        <View style={styles.separator} />
        <BrandText style={styles.textTitle}>NFT artwork</BrandText>
        <Image
          source={nftDroped.svg}
          style={{ aspectRatio: 1, width: 220, marginVertical: 12 }}
          resizeMode="contain"
        />
        <BrandText style={{ fontSize: 13 }}>{nftDroped.name}</BrandText>
        <View style={styles.separator} />
        <View style={styles.rowCenter}>
          <BrandText style={styles.textTitle}>Corner radius</BrandText>
          <BrandText style={{ fontSize: 14, color: primaryColor }}>
            {percentage}%
          </BrandText>
        </View>
        <Slider
          style={{ marginTop: 18 }}
          thumbStyle={{
            backgroundColor: "black",
            borderRadius: 1000,
            borderColor: primaryColor,
            borderWidth: 3,
          }}
          width={220}
          height={3}
          widthThumb={15}
          heightThumb={15}
          minimumTrackTintColor={primaryColor}
          maximumTrackTintColor={neutral44}
          onValueChange={(index: number) => {
            setSliderValue(index);
          }}
          value={sliderValue}
        />
        <View style={styles.separator} />
        <View style={styles.rowCenter}>
          <BrandText style={{ fontSize: 16 }}>Final Price</BrandText>
          <BrandText
            style={{ fontSize: 16, color: primaryColor, fontWeight: "700" }}
          >
            {price} $TORI
          </BrandText>
        </View>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <IconButton
              icon={require("../../../assets/icons/trash.svg")}
              iconColor={errorColor}
              iconHeight={12}
              iconWidth={12}
              onPress={() => {
                setNftDroped(undefined);
                setNftDropedAdjustment(undefined);
              }}
              width={56}
              height={48}
              backgroundColor="#F46F761A"
              style={{ borderWidth: 1, borderRadius: 6 }}
              borderColor={errorColor}
            />
            <PrimaryButton
              width={128}
              height={48}
              onPress={() => {}}
              text="Submit"
            />
          </View>
        </View>
      </View>
    );
  }
);

export default NftAdjustments;

const styles = StyleSheet.create({
  container: {
    width: 220,
    flex: 1,
  },
  textTitle: {
    fontSize: 14,
    color: neutral77,
  },
  separator: {
    height: 1,
    backgroundColor: neutral33,
    marginVertical: 20,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
