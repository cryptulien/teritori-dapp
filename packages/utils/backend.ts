import { grpc } from "@improbable-eng/grpc-web";

import { FreelanceServiceClientImpl } from "../api/freelance/v1/freelance";
import {
  MarketplaceServiceClientImpl,
  GrpcWebImpl,
} from "../api/marketplace/v1/marketplace";
import {
  P2eServiceClientImpl,
  GrpcWebImpl as P2eGrpcWebImpl,
} from "../api/p2e/v1/p2e";

const backendEndpoint = process.env.TERITORI_BACKEND_ENDPOINT;
const freelanceBackendEndpoint =
  process.env.TERITORI_FREELANCE_BACKEND_ENDPOINT;

if (!backendEndpoint) {
  throw new Error("missing TERITORI_BACKEND_ENDPOINT in env");
}
if (!freelanceBackendEndpoint) {
  throw new Error("missing TERITORI_FREELANCE_BACKEND_ENDPOINT in env");
}

const marketPlaceRpc = new GrpcWebImpl(backendEndpoint, {
  transport: grpc.WebsocketTransport(),
  debug: false,
  // metadata: new grpc.Metadata({ SomeHeader: "bar" }),
});

export const backendClient = new MarketplaceServiceClientImpl(marketPlaceRpc);

const p2eRpc = new P2eGrpcWebImpl(backendEndpoint, {
  transport: grpc.WebsocketTransport(),
  debug: false,
});

export const p2eBackendClient = new P2eServiceClientImpl(p2eRpc);

const freelanceRpc = new GrpcWebImpl(freelanceBackendEndpoint, {
  transport: grpc.WebsocketTransport(),
  debug: false,
  // metadata: new grpc.Metadata({ SomeHeader: "bar" }),
});

export const freelanceClient = new FreelanceServiceClientImpl(freelanceRpc);
