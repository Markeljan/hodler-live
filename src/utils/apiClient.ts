import axios from "axios";

const HUDDLE01_API_KEY = process.env.NEXT_PUBLIC_HUDDLE01_API_KEY;

export const createRoom = async (title: string, hostWallets: Array<string>) => {
  try {
    const { data } = await axios.post(
      "https://iriko.testing.huddle01.com/api/v1/create-room",
      {
        title: title,
        hostWallets: hostWallets,
      },
      {
        headers: {
          "x-api-key": HUDDLE01_API_KEY,
        },
      }
    );

    return data;
  } catch (error) {
    console.error("Error while creating room:", error);
    throw error;
  }
};

export const createGatedRoom = async (
  title: string,
  hostWallets: Array<string>,
  tokenType: string,
  chain: string,
  contractAddress: Array<string>
) => {
  try {
    const { data } = await axios.post(
      "https://iriko.testing.huddle01.com/api/v1/create-room",
      {
        title: title,
        tokenType: tokenType,
        hostWallets: hostWallets,
        chain: chain,
        contractAddress: contractAddress,
      },
      {
        headers: {
          "x-api-key": HUDDLE01_API_KEY,
        },
      }
    );

    return data;
  } catch (error) {
    console.error("Error while creating gated room:", error);
    throw error;
  }
};
