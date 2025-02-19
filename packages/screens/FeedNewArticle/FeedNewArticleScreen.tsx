import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import priceSVG from "../../../assets/icons/price.svg";
import { BrandText } from "../../components/BrandText";
import { SVG } from "../../components/SVG";
import { ScreenContainer } from "../../components/ScreenContainer";
import { WalletStatusBox } from "../../components/WalletStatusBox";
import { TertiaryBox } from "../../components/boxes/TertiaryBox";
import { FileUploader } from "../../components/fileUploader";
import {
  Label,
  TextInputCustom,
} from "../../components/inputs/TextInputCustom";
import {
  NewPostFormValues,
  PostCategory,
} from "../../components/socialFeed/NewsFeed/NewsFeed.type";
import { createPost } from "../../components/socialFeed/NewsFeed/NewsFeedQueries";
import { NotEnoughFundModal } from "../../components/socialFeed/NewsFeed/NotEnoughFundModal";
import { RichText } from "../../components/socialFeed/RichText";
import { PublishValues } from "../../components/socialFeed/RichText/RichText.type";
import { SpacerColumn } from "../../components/spacer";
import { useFeedbacks } from "../../context/FeedbacksProvider";
import { useUpdateAvailableFreePost } from "../../hooks/feed/useUpdateAvailableFreePost";
import { useUpdatePostFee } from "../../hooks/feed/useUpdatePostFee";
import { useBalances } from "../../hooks/useBalances";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useSelectedNetworkId } from "../../hooks/useSelectedNetwork";
import useSelectedWallet from "../../hooks/useSelectedWallet";
import { getUserId, NetworkKind } from "../../networks";
import { prettyPrice } from "../../utils/coins";
import { IMAGE_MIME_TYPES } from "../../utils/mime";
import { ScreenFC, useAppNavigation } from "../../utils/navigation";
import {
  ARTICLE_COVER_IMAGE_HEIGHT,
  generateIpfsKey,
} from "../../utils/social-feed";
import {
  neutral00,
  neutral11,
  neutral77,
  secondaryColor,
} from "../../utils/style/colors";
import { fontSemibold13, fontSemibold20 } from "../../utils/style/fonts";
import { layout, screenContentMaxWidth } from "../../utils/style/layout";
import { pluralOrNot } from "../../utils/text";

//TODO: In mobile : Make ActionsContainer accessible (floating button ?)

export const FeedNewArticleScreen: ScreenFC<"FeedNewArticle"> = () => {
  const isMobile = useIsMobile();
  const selectedNetworkId = useSelectedNetworkId();
  const wallet = useSelectedWallet();
  const { postFee } = useUpdatePostFee(selectedNetworkId, PostCategory.Article);
  const { freePostCount } = useUpdateAvailableFreePost(
    selectedNetworkId,
    PostCategory.Article,
    wallet
  );
  const [isNotEnoughFundModal, setNotEnoughFundModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setToastSuccess, setToastError } = useFeedbacks();
  const navigation = useAppNavigation();
  const userId = getUserId(selectedNetworkId, wallet?.address);
  const balances = useBalances(
    process.env.TERITORI_NETWORK_ID,
    wallet?.address
  );
  const {
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<NewPostFormValues>({
    defaultValues: {
      title: "",
      message: "",
      files: [],
      gifs: [],
      hashtags: [],
      mentions: [],
    },
    mode: "onBlur",
  });
  //TODO: Not handled for now
  // const { mutate: openGraphMutate, data: openGraphData } = useOpenGraph();

  const formValues = watch();

  const initSubmit = async ({
    html,
    hashtags,
    mentions,
    images,
    gifs,
    audios,
    videos,
  }: PublishValues) => {
    const toriBalance = balances.find((bal) => bal.denom === "utori");
    const files = [
      ...(formValues.files || []),
      ...images,
      ...audios,
      ...videos,
    ];

    if (postFee > Number(toriBalance?.amount) && !freePostCount) {
      return setNotEnoughFundModal(true);
    }
    let pinataJWTKey = undefined;
    if (files?.length) {
      pinataJWTKey = await generateIpfsKey(selectedNetworkId, userId);
    }

    const result = await createPost({
      networkId: selectedNetworkId,
      wallet,
      freePostCount,
      category: PostCategory.Article,
      fee: postFee,
      formValues: {
        ...formValues,
        gifs,
        files,
        mentions,
        hashtags,
        message: html,
      },
      // TODO: We need this in backend, since opengraph card must be added for each written url ?
      // openGraph: undefined,
      pinataJWTKey,
    });
    return result;
  };

  //TODO: Keep short post formValues when returning to short post
  const navigateBack = () => navigation.navigate("Feed");

  const onPublish = async (values: PublishValues) => {
    setLoading(true);
    try {
      const result = await initSubmit(values);
      if (!result) {
        console.error("upload file err : Fail to pin to IPFS");
        setToastError({
          title: "File upload failed",
          message: "Fail to pin to IPFS, please try to Publish again",
        });
      } else {
        setToastSuccess({ title: "Post submitted successfully.", message: "" });
        navigateBack();
        reset();
      }
    } catch (err) {
      setToastError({
        title: "Something went wrong.",
        message: err instanceof Error ? err.message : `${err}`,
      });
      console.error("post submit error", err);
    }

    setLoading(false);
  };

  // // OpenGraph URL preview
  // useEffect(() => {
  //   addedUrls.forEach(url => {
  //     openGraphMutate({
  //       url,
  //     });
  //
  //   })
  // }, [addedUrls])

  return (
    <ScreenContainer
      forceNetworkKind={NetworkKind.Cosmos}
      responsive
      mobileTitle="NEW ARTICLE"
      maxWidth={screenContentMaxWidth}
      headerChildren={<BrandText style={fontSemibold20}>New Article</BrandText>}
      onBackPress={navigateBack}
      footerChildren
    >
      <NotEnoughFundModal
        onClose={() => setNotEnoughFundModal(false)}
        visible={isNotEnoughFundModal}
      />

      <View
        style={{
          marginTop: isMobile ? layout.padding_x2 : layout.contentPadding,
        }}
      >
        <WalletStatusBox />
        <SpacerColumn size={3} />

        <TertiaryBox
          fullWidth
          mainContainerStyle={{
            paddingVertical: layout.padding_x1,
            paddingHorizontal: layout.padding_x1_5,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            height: 48,
            backgroundColor: neutral11,
          }}
        >
          <SVG
            source={priceSVG}
            height={24}
            width={24}
            color={secondaryColor}
          />
          <BrandText
            style={[
              fontSemibold13,
              { color: neutral77, marginLeft: layout.padding_x1 },
            ]}
          >
            {freePostCount
              ? `You have ${freePostCount} free ${pluralOrNot(
                  "Article",
                  freePostCount
                )} left`
              : `The cost for this Article is ${prettyPrice(
                  selectedNetworkId,
                  postFee.toString(),
                  "utori"
                )}`}
          </BrandText>
        </TertiaryBox>

        <FileUploader
          label="Cover image"
          fileHeight={ARTICLE_COVER_IMAGE_HEIGHT}
          isImageCover
          style={{
            marginTop: layout.padding_x3,
            width: "100%",
          }}
          onUpload={(files) =>
            setValue("files", [
              ...(formValues.files || []),
              { ...files[0], isCoverImage: true },
            ])
          }
          mimeTypes={IMAGE_MIME_TYPES}
        />

        <TextInputCustom<NewPostFormValues>
          noBrokenCorners
          rules={{ required: true }}
          height={48}
          label="Give a title to make an Article"
          placeHolder="Type title here"
          name="title"
          control={control}
          variant="labelOutside"
          containerStyle={{ marginVertical: layout.padding_x3 }}
          boxMainContainerStyle={{
            backgroundColor: neutral00,
            borderRadius: 12,
          }}
        />
        <Label isRequired>Article content</Label>
        <SpacerColumn size={1} />
        {/**@ts-ignore  error:TS2589: Type instantiation is excessively deep and possibly infinite. */}
        <Controller
          name="message"
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur } }) => (
            <RichText
              onChange={onChange}
              onBlur={onBlur}
              initialValue={formValues.message}
              loading={loading}
              publishDisabled={
                errors?.message?.type === "required" ||
                !formValues.message ||
                !formValues.title ||
                !wallet
              }
              onPublish={onPublish}
            />
          )}
        />
      </View>
    </ScreenContainer>
  );
};
