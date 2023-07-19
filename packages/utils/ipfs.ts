import axios from "axios";

import { generateIpfsKey } from "./social-feed";
import { LocalFileData, RemoteFileData } from "./types/feed";
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

export const uploadJSONToIPFS = async (data: object): Promise<string> => {
  try {
    const res = await axios({
      method: "POST",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
      data,
    });
    return res.data.IpfsHash;
  } catch (exception) {
    console.log(exception);
    return "";
  }
};
