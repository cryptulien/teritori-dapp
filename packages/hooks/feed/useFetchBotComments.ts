import { useQuery } from "@tanstack/react-query";

import { BotAnswerRequest } from "../../api/feed/v1/feed";
import { mustGetFeedClient } from "../../utils/backend";
import { useSelectedNetworkId } from "../useSelectedNetwork";

export const useFetchBotComments = (req: BotAnswerRequest) => {
  const selectedNetworkId = useSelectedNetworkId();

  const { isLoading, data } = useQuery({
    queryKey: ["botData"],
    queryFn: async () => {
      try {
        // Overriding the posts request with the current pageParam as offset
        const botAnswerRequest: BotAnswerRequest = { ...req };
        // Getting posts
        const answer = await getBotComment(selectedNetworkId, botAnswerRequest);
        return answer;
      } catch (err) {
        console.error("initData err", err);
        return "";
      }
    },
  });
  return { data, isLoading };
};

const getBotComment = async (networkId: string, req: BotAnswerRequest) => {
  try {
    // ===== We use FeedService to be able to fetch filtered posts
    const feedClient = mustGetFeedClient(networkId);
    const response = await feedClient.BotAnswer(req);
    // ---- We sort by creation date
    return response.answer;
  } catch (err) {
    console.log("initData err", err);
    return "";
  }
};
