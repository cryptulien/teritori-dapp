import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { SocialCardHeader } from "./SocialCardHeader";
import { SocialMessageContent } from "./SocialMessageContent";
import { useIsMobile } from "../../../hooks/useIsMobile";
import {
  neutral00,
  neutral22,
  neutral33,
  primaryColor,
  secondaryColor,
  withAlpha,
} from "../../../utils/style/colors";
import { layout } from "../../../utils/style/layout";
import FlexRow from "../../FlexRow";
import { AnimationFadeIn } from "../../animations/AnimationFadeIn";
import { AnimationFadeInOut } from "../../animations/AnimationFadeInOut";
import { CustomPressable } from "../../buttons/CustomPressable";
import { LINES_HORIZONTAL_SPACE } from "../../cards/CommentsContainer";
import { SpacerColumn, SpacerRow } from "../../spacer";
import { PostCategory, SocialFeedMetadata } from "../NewsFeed/NewsFeed.type";

const BREAKPOINT_S = 480;

export interface SocialCommentCardProps {
  // We use the cardWidth provided from CommentsContainer.
  // The width of the CommentCard depends on its parent's width. The comments are a tree
  cardWidth: number;
  comment: string;
  style?: StyleProp<ViewStyle>;
}

export const SocialCommentBotCard: React.FC<SocialCommentCardProps> = ({
  style,
  comment,
  cardWidth,
}) => {
  const [viewWidth, setViewWidth] = useState(0);
  const isMobile = useIsMobile();
  const metadata: SocialFeedMetadata = {
    title: "",
    message: comment,
    hashtags: [],
    mentions: [],
    createdAt: "",
    updatedAt: "",
  };
  return (
    <CustomPressable
      onLayout={(e) => setViewWidth(e.nativeEvent.layout.width)}
      disabled={false}
      onPress={() => {}}
      style={{ width: cardWidth }}
    >
      <AnimationFadeIn>
        <View style={styles.container}>
          {!isMobile ? (
            <View
              style={[styles.curvedLine, { width: LINES_HORIZONTAL_SPACE }]}
            />
          ) : null}

          {/*========== Card */}
          <View style={[styles.commentContainer, style]}>
            <AnimationFadeInOut visible style={styles.loadingOverlay}>
              <ActivityIndicator color={primaryColor} />
            </AnimationFadeInOut>

            <View style={styles.commentContainerInside}>
              {/*====== Card Header */}
              <SocialCardHeader
                authorAddress=""
                authorId="bot"
                postMetadata={metadata}
              />

              <SpacerColumn size={2} />

              {/*====== Card Content */}
              <SocialMessageContent
                metadata={metadata}
                postCategory={PostCategory.Comment}
              />

              <SpacerColumn size={2} />

              {/*====== Card Actions */}
              <FlexRow
                justifyContent="flex-end"
                style={
                  viewWidth < BREAKPOINT_S && {
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }
                }
              >
                <SpacerRow size={2.5} />
              </FlexRow>
            </View>
          </View>
        </View>
      </AnimationFadeIn>
    </CustomPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    zIndex: 1,
    position: "relative",
    marginLeft: -1,
  },
  curvedLine: {
    height: 10,
    marginTop: 70,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 30,
    borderColor: neutral22,
  },
  commentContainer: {
    overflow: "hidden",
    borderRadius: 12,
    marginVertical: 0.5,
    borderColor: neutral33,
    borderWidth: 1,
    flex: 1,
  },
  commentContainerInside: {
    paddingVertical: layout.padding_x2,
    paddingHorizontal: layout.padding_x2_5,
  },
  content: { flex: 1 },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  repliesButtonContainer: {
    zIndex: 10,
    position: "absolute",
    bottom: -21,
    right: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  actionContainer: {
    borderTopWidth: 1,
    marginTop: layout.padding_x1_5,
    paddingTop: layout.padding_x1_5,
    borderColor: neutral22,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  extraLineHider: {
    marginTop: 73,
    width: 1,
    height: "100%",
    backgroundColor: neutral00,
    zIndex: 1000,
    position: "absolute",
    left: 0,
  },
  loadingOverlay: {
    backgroundColor: withAlpha(secondaryColor, 0.2),
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});
