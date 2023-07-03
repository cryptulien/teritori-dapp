import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ImageBackground,
  FlatList,
} from "react-native";

import { ResourceBox } from "./ResourceBox";
import resourceLogo from "../../../../assets/LogoPathwarOverview/ResourceLogo.svg";
import resourceBanner from "../../../../assets/banners/resourcesBanner.png";
import { Resources } from "../../../api/pathwar/v1/pathwar";
import { BrandText } from "../../../components/BrandText";
import { DropDownButton } from "../../../components/Pathwar/Resource/DropDownFilter";
import { SVG } from "../../../components/SVG";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { TertiaryBox } from "../../../components/boxes/TertiaryBox";
import { SearchInput } from "../../../components/sorts/SearchInput";
import { SpacerColumn } from "../../../components/spacer";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { useMaxResolution } from "../../../hooks/useMaxResolution";
import { useAppNavigation } from "../../../utils/navigation";
import { secondaryColor, neutral00 } from "../../../utils/style/colors";
import { fontSemibold14, fontSemibold20 } from "../../../utils/style/fonts";
import {
  layout,
  screenContentMaxWidthLarge,
} from "../../../utils/style/layout";

export const ResourceScreen: React.FC = () => {
  const { height } = useMaxResolution({ isLarge: true });
  const navigation = useAppNavigation();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState<string>("");
  const data = [
    {
      id: 1,
      title: "title",
      tags: [
        {
          id: 1,
          text: "video",
        },
      ],
    },
  ] as Resources[];
  return (
    <ScreenContainer
      responsive
      isLarge
      footerChildren={<></>}
      headerChildren={<BrandText style={fontSemibold20}>Resources</BrandText>}
      onBackPress={() => navigation.navigate("Pathwar")}
    >
      <View>
        <ImageBackground
          source={resourceBanner}
          style={{
            height: 400,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SVG source={resourceLogo} />
        </ImageBackground>
      </View>

      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: layout.padding_x1_5,
          zIndex: 2,
        }}
      >
        <DropDownButton />

        <View style={{ alignItems: "flex-start" }}>
          <SearchInput
            handleChangeText={setSearch}
            borderRadius={layout.borderRadius}
            height={45}
            style={{
              width: isMobile ? "100%" : 270,
              backgroundColor: neutral00,
              // position: "absolute",
              // top: -93,
              // right: -122,
            }}
          />
        </View>
        <View
          style={{
            // hide as we don't have design for this
            // @ts-ignore
            visibility: "hidden",
          }}
        >
          <TouchableOpacity style={{ alignItems: "flex-start" }}>
            <TertiaryBox mainContainerStyle={{ borderColor: secondaryColor }}>
              <View
                style={{ flexDirection: "row", margin: layout.padding_x1_5 }}
              >
                <BrandText
                  style={[{ marginRight: layout.padding_x1 }, fontSemibold14]}
                >
                  +
                </BrandText>
                <BrandText style={fontSemibold14}>Suggest content</BrandText>
              </View>
            </TertiaryBox>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignSelf: "center",
          marginTop: layout.padding_x2_5,
        }}
      >
        <FlatList
          data={data.filter((resource) =>
            resource.title.toLowerCase().includes(search.toLowerCase())
          )}
          style={{
            width: "100%",
          }}
          contentContainerStyle={{
            maxWidth: screenContentMaxWidthLarge,
            maxHeight: height,
          }}
          showsHorizontalScrollIndicator={false}
          columnWrapperStyle={{ flexWrap: "wrap", flex: 1, marginTop: 5 }}
          numColumns={99} // needed to deal with wrap via css
          ItemSeparatorComponent={() => <SpacerColumn size={2} />}
          ListEmptyComponent={
            <BrandText style={fontSemibold20}>No results found.</BrandText>
          }
          renderItem={({ item, index }) => {
            return <ResourceBox data={item} key={index} />;
          }}
        />
      </View>
    </ScreenContainer>
  );
};
