import React from "react";
import { StyleProp, TouchableOpacity, View, ViewStyle, useWindowDimensions } from "react-native";

import chevronDownSVG from "../../../assets/icons/chevron-down.svg";
import chevronUpSVG from "../../../assets/icons/chevron-up.svg";
import sortSVG from "../../../assets/icons/sort.svg";
import { SortDirection } from "../../api/marketplace/v1/marketplace";
import { neutral11, secondaryColor } from "../../utils/style/colors";
import { fontSemibold14 } from "../../utils/style/fonts";
import { BrandText } from "../BrandText";
import { SVG } from "../SVG";
import { TertiaryBox } from "../boxes/TertiaryBox";

export const SortButton: React.FC<{
  sortDirection: SortDirection;
  onChangeSortDirection: (val: SortDirection) => void;
  style?: StyleProp<ViewStyle>;
}> = ({ style, sortDirection, onChangeSortDirection }) => {
  const { width } = useWindowDimensions();
  const handlePress = () => {
    if (sortDirection === SortDirection.SORT_DIRECTION_DESCENDING) {
      onChangeSortDirection(SortDirection.SORT_DIRECTION_ASCENDING);
    } else {
      onChangeSortDirection(SortDirection.SORT_DIRECTION_DESCENDING);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style}>
      <TertiaryBox
        fullWidth
        mainContainerStyle={{
          borderColor: "#FFFFFF",
          paddingHorizontal: 13,
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: neutral11,
        }}
        height={48}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <SVG
            source={sortSVG}
            height={16}
            width={16}
            style={{ marginRight: 8 }}
          />
          <BrandText style={fontSemibold14}>
            Price{" "}
            {width > 500 ?
              sortDirection === SortDirection.SORT_DIRECTION_ASCENDING
              ? "Ascending"
                : "Descending"
              :
              undefined
            }
          </BrandText>
        </View>

        <SVG
          source={
            sortDirection === SortDirection.SORT_DIRECTION_ASCENDING
              ? chevronUpSVG
              : chevronDownSVG
          }
          height={16}
          width={16}
          style={{ marginLeft: 8 }}
          color={secondaryColor}
        />
      </TertiaryBox>
    </TouchableOpacity>
  );
};
