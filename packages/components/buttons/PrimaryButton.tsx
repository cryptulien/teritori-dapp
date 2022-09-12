import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleProp,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { SvgProps } from "react-native-svg";

import {
  borderRadiusButton,
  ButtonsSize,
  heightButton,
} from "../../utils/style/buttons";
import {
  neutral77,
  primaryColor,
  primaryTextColor,
} from "../../utils/style/colors";
import { fontSemibold14 } from "../../utils/style/fonts";
import { BrandText } from "../BrandText";
import { SVG } from "../SVG";
import { SecondaryBox } from "../boxes/SecondaryBox";

export const PrimaryButton: React.FC<{
  size: ButtonsSize;
  text: string;
  width?: number;
  onPress?: (() => Promise<void>) | (() => void);
  squaresBackgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  iconSVG?: React.FC<SvgProps>;
  disabled?: boolean;
  fullWidth?: boolean;
  loader?: boolean;
}> = ({
  // If no width, the buttons will fit the content including paddingHorizontal 20
  width,
  size,
  text,
  onPress,
  squaresBackgroundColor,
  style,
  iconSVG,
  disabled = false,
  fullWidth = false,
  loader,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = useCallback(async () => {
    if (isLoading || !onPress) {
      return;
    }
    setIsLoading(true);
    try {
      await onPress();
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  }, [onPress, isLoading]);

  const isDisabled = !!(disabled || (loader && isLoading));

  const boxProps = {
    style,
    disabled,
    squaresBackgroundColor,
    width,
    fullWidth,
  };

  return (
    <TouchableOpacity onPress={onPress ? handlePress : undefined} disabled={isDisabled} style={{ width: fullWidth ? "100%" : width }}>
      <SecondaryBox
        height={heightButton(size)}
        mainContainerStyle={{
          flexDirection: "row",
          borderRadius: borderRadiusButton(size),
          backgroundColor: primaryColor,
          paddingHorizontal: 20,
        }}
        {...boxProps}
      >
        {iconSVG ? (
          <SVG
            source={iconSVG}
            width={16}
            height={16}
            style={{ marginRight: 8 }}
          />
        ) : null}

        {loader && isLoading ? (
          <ActivityIndicator />
        ) : (
          <BrandText
            style={[
              fontSemibold14,
              {
                color: isDisabled ? neutral77 : primaryTextColor,
                textAlign: "center",
              },
            ]}
          >
            {text}
          </BrandText>
        )}
      </SecondaryBox>
    </TouchableOpacity>
  );
};
