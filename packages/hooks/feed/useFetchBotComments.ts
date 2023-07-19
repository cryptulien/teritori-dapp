import { useInfiniteQuery } from "@tanstack/react-query";

import { Post, BotAnswerRequest } from "../../api/feed/v1/feed";
import { PostResult } from "../../contracts-clients/teritori-social-feed/TeritoriSocialFeed.types";
import { mustGetFeedClient } from "../../utils/backend";
import { useSelectedNetworkId } from "../useSelectedNetwork";

export type FetchCommentResponse = {
  list: PostResult[];
} | null;

export const combineFetchCommentPages = (pages: FetchCommentResponse[]) =>
  pages.reduce(
    (acc: PostResult[], page) => [...acc, ...(page?.list || [])],
    []
  );

export const useFetchBotComments = (req: BotAnswerRequest) => {
  // variable
  const selectedNetworkId = useSelectedNetworkId();

  // request
  const data = useInfiniteQuery<FetchCommentResponse>(
    ["posts", selectedNetworkId, { ...req }],
    async () => {
      const postsRequest: BotAnswerRequest = req;
      const list = await getPosts(selectedNetworkId, postsRequest);
      const postResult: PostResult[] = [];
      list.map((post) => {
        postResult.push({
          category: post.category,
          deleted: post.isDeleted,
          identifier: post.identifier,
          metadata: post.metadata,
          parent_post_identifier: post.parentPostIdentifier,
          post_by: "",
          reactions: [],
          sub_post_length: post.subPostLength,
          tip_amount: post.tipAmount.toString(),
          user_reactions: [],
        });
      });
      return { list: postResult };
    },
    {
      getNextPageParam: () => {},
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );

  return data;
};

const getPosts = async (networkId: string, req: BotAnswerRequest) => {
  try {
    // ===== We use FeedService to be able to fetch filtered posts
    const feedClient = mustGetFeedClient(networkId);
    const response = await feedClient.BotAnswer(req);
    // ---- We sort by creation date
    return response.posts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.log("initData err", err);
    return [] as Post[];
  }
};
