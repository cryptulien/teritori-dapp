import { generateIpfsKey } from "./social-feed";
import { LocalFileData, RemoteFileData } from "./types/feed";
import { pinataPinJSONToIPFS } from "../candymachine/pinata-upload";
import { uploadPostFilesToPinata } from "../components/socialFeed/NewsFeed/NewsFeedQueries";

export const ipfsURLToHTTPURL = (ipfsURL: string | undefined) => {
  if (!ipfsURL) {
    return "";
  }
  if (ipfsURL.startsWith("https://") || ipfsURL.startsWith("blob:")) {
    return ipfsURL;
  }
  if (ipfsURL.startsWith("ipfs://")) {
    return ipfsURL.replace("ipfs://", "https://nftstorage.link/ipfs/");
  }
  return "https://nftstorage.link/ipfs/" + ipfsURL;
};

export const uploadFileToIPFS = async (
  file: LocalFileData,
  networkId: string,
  userId: string
) => {
  let uploadedFiles: RemoteFileData[] = [];
  const pinataJWTKey = await generateIpfsKey(networkId, userId);

  if (pinataJWTKey) {
    uploadedFiles = await uploadPostFilesToPinata({
      files: [file],
      pinataJWTKey,
    });
  }
  if (!uploadedFiles.find((file) => file.url)) {
    console.error("upload file err : Fail to pin to IPFS");
  } else return uploadedFiles[0];
};

export const uploadJSONToIPFS = async (
  json: object,
  networkId: string,
  userId: string
) => {
  let uploadedFile: RemoteFileData | undefined;
  const pinataJWTKey = await generateIpfsKey(networkId, userId);

  if (pinataJWTKey) {
    uploadedFile = await pinataPinJSONToIPFS({
      json,
      pinataJWTKey,
    });
  }
  if (!uploadedFile) {
    console.error("upload file err : Fail to pin to IPFS");
  } else return uploadedFile;
};
