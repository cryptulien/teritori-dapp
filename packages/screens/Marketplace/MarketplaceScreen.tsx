import React from "react";
import { View } from "react-native";

import {
  MintState,
  Sort,
  SortDirection,
} from "../../api/marketplace/v1/marketplace";
import { ScreenContainer } from "../../components/ScreenContainer";
import { CollectionGallery } from "../../components/collections/CollectionGallery";
import { useSelectedNetworkId } from "../../hooks/useSelectedNetwork";
import { getNetwork } from "../../networks";
import { ScreenFC } from "../../utils/navigation";
import { layout } from "../../utils/style/layout";

export const MarketplaceScreen: ScreenFC<"Marketplace"> = () => {
  const selectedNetworkId = useSelectedNetworkId();

  return (
    <ScreenContainer responsive>
      <View
        style={{
          paddingBottom: layout.contentPadding,
        }}
      >
        <CollectionGallery
          title={`${getNetwork(selectedNetworkId)?.displayName} Collections`}
          req={{
            networkId: selectedNetworkId,
            sortDirection: SortDirection.SORT_DIRECTION_DESCENDING,
            upcoming: false,
            sort: Sort.SORT_VOLUME,
            limit: 32,
            offset: 0,
            mintState: MintState.MINT_STATE_UNSPECIFIED,
          }}
        />
        <CollectionGallery
          title="Upcoming Launches"
          req={{
            networkId: selectedNetworkId,
            upcoming: true,
            sortDirection: SortDirection.SORT_DIRECTION_UNSPECIFIED,
            sort: Sort.SORT_UNSPECIFIED,
            limit: 16,
            offset: 0,
            mintState: MintState.MINT_STATE_UNSPECIFIED,
          }}
        />
      </View>
    </ScreenContainer>
  );
};
