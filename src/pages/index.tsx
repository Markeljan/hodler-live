import { useEffect, useRef, useState } from "react";
import { useEventListener, useHuddle01 } from "@huddle01/react";
import { Audio, Video } from "@huddle01/react/components";
import {
  useAudio,
  useLobby,
  useMeetingMachine,
  usePeers,
  useRoom,
  useVideo,
  useRecording,
} from "@huddle01/react/hooks";
import { useDisplayName } from "@huddle01/react/app-utils";
import { getAccessToken, getMessage } from "@huddle01/auth";
import Button from "../components/Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { createGatedRoom, createRoom } from "../utils/apiClient";
import Input from "../components/Input";

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || "";

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { state, send } = useMeetingMachine();
  const [roomId, setRoomId] = useState("qde-hyzj-drp");
  const [displayNameText, setDisplayNameText] = useState("Guest");
  const [projectId, setProjectId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const { initialize } = useHuddle01();
  const { joinLobby } = useLobby();
  const {
    fetchAudioStream,
    produceAudio,
    stopAudioStream,
    stopProducingAudio,
    stream: micStream,
  } = useAudio();
  const {
    fetchVideoStream,
    produceVideo,
    stopVideoStream,
    stopProducingVideo,
    stream: camStream,
  } = useVideo();
  const { joinRoom, leaveRoom } = useRoom();
  const { peers } = usePeers();
  const { startRecording, stopRecording, error, data: recordingData } = useRecording();
  const { setDisplayName, error: displayNameError } = useDisplayName();
  const [roomTitle, setRoomTitle] = useState("");
  const [walletList, setWalletList] = useState("");
  const { address } = useAccount();

  const { signMessage } = useSignMessage({
    onSuccess: async (data) => {
      const token = await getAccessToken(data, address as string);
      console.log("Token: ", token);
      setAccessToken(token.accessToken);
    },
  });

  useEffect(() => {
    initialize(PROJECT_ID);
  }, []);

  async function handleCreateRoom(title: string, hostWallets: Array<string>) {
    const response = await createRoom(title, hostWallets);
    console.log("Response: ", response);
    setRoomId(response.roomId);
  }

  async function handleCreateGatedRoom(
    title: string,
    hostWallets: Array<string>,
    tokenType: string,
    chain: string,
    contractAddress: Array<string>
  ) {
    const response = await createGatedRoom(title, hostWallets, tokenType, chain, contractAddress);
    console.log("Response: ", response);
    setRoomId(response.roomId);
  }

  // Event Listner
  useEventListener("lobby:cam-on", () => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  });

  useEventListener("room:joined", () => {
    console.log("room:joined");
  });
  useEventListener("lobby:joined", () => {
    console.log("lobby:joined");
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="h-1/4 w-1/4">
        <img src="/hodler-mountain.png" alt="Hodler" />
      </div>
      <div className="grid grid-cols-2">
        <div>
          <h1 className="text-6xl font-bold">Hodler.live</h1>

          <ConnectButton />
          <div>
            <Button
              onClick={async () => {
                const msg = await getMessage(address || "");
                signMessage({ message: msg.message });
              }}
            >
              Sign Message
            </Button>
          </div>

          <h2 className="text-2xl">Room State</h2>
          <h3 className="break-words">{JSON.stringify(state.value)}</h3>

          <h2 className="text-2xl">Me Id</h2>
          <div className="break-words">{JSON.stringify(state.context.peerId)}</div>
          <h2 className="text-2xl">DisplayName</h2>
          <div className="break-words">{JSON.stringify(state.context.displayName)}</div>
          <h2 className="text-2xl">Recording Data</h2>
          <div className="break-words">{JSON.stringify(recordingData)}</div>

          <h2 className="text-2xl">Error</h2>
          <div className="break-words text-red-500">{JSON.stringify(state.context.error)}</div>
          <h2 className="text-2xl">Peers</h2>
          <div className="break-words">{JSON.stringify(peers)}</div>
          <h2 className="text-2xl">Consumers</h2>
          <div className="break-words">{JSON.stringify(state.context.consumers)}</div>

          <h2 className="text-3xl text-blue-500 font-extrabold">Idle</h2>
          
          <Input
            type="text"
            placeholder="Your Project Id"
            value={projectId}
            onChange={setProjectId}
          />
          <Button
            disabled={!initialize.isCallable}
            onClick={() => {
              initialize(projectId);
            }}
          >
            INIT
          </Button>

          <h2 className="text-3xl text-red-500 font-extrabold">Create Room</h2>
          <Input type="text" placeholder="Room Title" value={roomTitle} onChange={setRoomTitle} />
          <Input
            type="text"
            placeholder="Wallet List"
            value={walletList}
            onChange={setWalletList}
          />
          <Button
            onClick={() => {
              handleCreateRoom(roomTitle, walletList.split(","));
            }}
          >
            Create Room
          </Button>

          <h2 className="text-3xl text-red-500 font-extrabold">Create Room</h2>
          <Input type="text" placeholder="Room Title" value={roomTitle} onChange={setRoomTitle} />
          <Input
            type="text"
            placeholder="Wallet List"
            value={walletList}
            onChange={setWalletList}
          />
          <Button
            onClick={() => {
              handleCreateGatedRoom(roomTitle, walletList.split(","), "ERC20", "ETHEREUM", [
                "0x408e41876cCCDC0F92210600ef50372656052a38",
              ]);
            }}
          >
            Create Gated Room
          </Button>

          <h2 className="text-3xl text-red-500 font-extrabold">Initialized</h2>
          <Input type="text" placeholder="Your Room Id" value={roomId} onChange={setRoomId} />
          <Input
            type="text"
            placeholder="Your Access Token (optional)"
            value={accessToken}
            onChange={setAccessToken}
          />
          <Button
            disabled={!joinLobby.isCallable}
            onClick={() => {
              if (accessToken) joinLobby(roomId, accessToken);
              else joinLobby(roomId);
            }}
          >
            JOIN_LOBBY
          </Button>

          <h2 className="text-3xl text-yellow-500 font-extrabold">Lobby</h2>
          <div className="flex gap-4 flex-wrap">
            <Input
              type="text"
              placeholder="Your Room Id"
              value={displayNameText}
              onChange={setDisplayNameText}
            />
            <Button
              disabled={!setDisplayName.isCallable}
              onClick={() => {
                setDisplayName(displayNameText);
              }}
            >
              {`SET_DISPLAY_NAME error: ${displayNameError}`}
            </Button>
            <Button disabled={!fetchVideoStream.isCallable} onClick={fetchVideoStream}>
              FETCH_VIDEO_STREAM
            </Button>

            <Button disabled={!fetchAudioStream.isCallable} onClick={fetchAudioStream}>
              FETCH_AUDIO_STREAM
            </Button>

            <Button disabled={!joinRoom.isCallable} onClick={joinRoom}>
              JOIN_ROOM
            </Button>

            <Button
              disabled={!state.matches("Initialized.JoinedLobby")}
              onClick={() => send("LEAVE_LOBBY")}
            >
              LEAVE_LOBBY
            </Button>

            <Button disabled={!stopVideoStream.isCallable} onClick={stopVideoStream}>
              STOP_VIDEO_STREAM
            </Button>
            <Button disabled={!stopAudioStream.isCallable} onClick={stopAudioStream}>
              STOP_AUDIO_STREAM
            </Button>
          </div>

          <h2 className="text-3xl text-green-600 font-extrabold">Room</h2>
          <div className="flex gap-4 flex-wrap">
            <Button disabled={!produceAudio.isCallable} onClick={() => produceAudio(micStream)}>
              PRODUCE_MIC
            </Button>

            <Button disabled={!produceVideo.isCallable} onClick={() => produceVideo(camStream)}>
              PRODUCE_CAM
            </Button>

            <Button disabled={!stopProducingAudio.isCallable} onClick={() => stopProducingAudio()}>
              STOP_PRODUCING_MIC
            </Button>

            <Button disabled={!stopProducingVideo.isCallable} onClick={() => stopProducingVideo()}>
              STOP_PRODUCING_CAM
            </Button>

            <Button
              disabled={!startRecording.isCallable}
              onClick={() => startRecording(`${window.location.href}rec/${roomId}`)}
            >
              {`START_RECORDING error: ${error}`}
            </Button>
            <Button disabled={!stopRecording.isCallable} onClick={stopRecording}>
              STOP_RECORDING
            </Button>

            <Button disabled={!leaveRoom.isCallable} onClick={leaveRoom}>
              LEAVE_ROOM
            </Button>
          </div>

          {/* Uncomment to see the Xstate Inspector */}
          {/* <Inspect /> */}
        </div>
        <div>
          Me Video:
          <video ref={videoRef} autoPlay muted></video>
          <div className="grid grid-cols-4">
            {Object.values(peers)
              .filter((peer) => peer.cam)
              .map((peer) => (
                <>
                  role: {peer.role}
                  <Video key={peer.peerId} peerId={peer.peerId} track={peer.cam} debug />
                </>
              ))}
            {Object.values(peers)
              .filter((peer) => peer.mic)
              .map((peer) => (
                <Audio key={peer.peerId} peerId={peer.peerId} track={peer.mic} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
