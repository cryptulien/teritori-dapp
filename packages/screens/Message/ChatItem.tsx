import moment from "moment";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { Avatar, Badge } from "react-native-paper";
import { useSelector } from "react-redux";

import warning from "../../../../assets/icons/warning.svg";
import avatarPNG from "../../../assets/icons/ava.png";
import doubleCheckSVG from "../../../assets/icons/doublecheck.svg";
import singleCheckSVG from "../../../assets/icons/singlecheck.svg";
import { Separator } from "../../../components/Separator";
import { BrandText } from "../../components/BrandText";
import FlexRow from "../../components/FlexRow";
import { SVG } from "../../components/SVG";
import SideBarChatConversation from "../../components/sidebarchat/SideBarChatConversation";
import { SpacerColumn, SpacerRow } from "../../components/spacer";
import { useNSUserInfo } from "../../hooks/useNSUserInfo";
import {
  selectLastMessageByGroupPk,
  selectMessageListByGroupPk,
} from "../../store/slices/message";
import { useAppNavigation } from "../../utils/navigation";
import {
  neutral00,
  neutral22,
  neutralA3,
  secondaryColor,
} from "../../utils/style/colors";
import {
  fontMedium10,
  fontSemibold11,
  fontSemibold13,
} from "../../utils/style/fonts";
import { layout } from "../../utils/style/layout";
import { Conversation } from "../../utils/types/message";
interface ChatItemProps {
  data: Conversation;
  onPress: () => void;
  isActive: boolean;
}

export const ChatItem = ({ data, onPress, isActive }: ChatItemProps) => {
  const navigation = useAppNavigation();

  const lastMessage = useSelector(selectLastMessageByGroupPk(data.id));

  const { metadata } = useNSUserInfo(
    data.members?.[0]?.tokenId || "sakul.tori"
  );

  console.log("last msg", lastMessage);

  return (
    <TouchableOpacity
      onPress={() =>
        ["android", "ios"].includes(Platform.OS)
          ? navigation.navigate("ChatSection")
          : onPress()
      }
    >
      <View
        style={{
          backgroundColor: isActive ? neutral22 : neutral00,
          padding: layout.padding_x1,
          borderRadius: 4,
        }}
      >
        <FlexRow justifyContent="space-between">
          <View>
            <FlexRow>
              <Avatar.Image size={40} source={metadata?.image || avatarPNG} />
              {/* <Badge
                style={{
                  position: "absolute",
                  top: 30,
                  left: 30,

                  backgroundColor:
                }}
                size={12}
              /> */}
              <SpacerRow size={1.5} />
              <View>
                <FlexRow>
                  <BrandText
                    style={[fontSemibold13, { color: secondaryColor }]}
                  >
                    {data.name || metadata.public_name || "Anon"}
                  </BrandText>
                </FlexRow>
                <SpacerColumn size={0.5} />
                <BrandText style={[fontSemibold11, { color: neutralA3 }]}>
                  {lastMessage?.payload?.message}
                </BrandText>
              </View>
            </FlexRow>
          </View>
          {!!lastMessage && (
            <View>
              <FlexRow>
                <BrandText style={[fontMedium10, { color: secondaryColor }]}>
                  {moment(lastMessage?.timestamp).fromNow()}
                </BrandText>
                <SpacerRow size={0.6} />
                <SVG
                  width={16}
                  height={16}
                  source={lastMessage?.isRead ? doubleCheckSVG : singleCheckSVG}
                />
              </FlexRow>
            </View>
          )}
        </FlexRow>
      </View>
    </TouchableOpacity>
  );
};
