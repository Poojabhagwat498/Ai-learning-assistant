import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/socket";

const Meeting = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // =========================
  // 🎥 INIT MEDIA
  // =========================
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error("Media error:", err);
      alert("Allow camera & mic permissions");
    }
  };

  // =========================
  // 🔗 CREATE PEER
  // =========================
  const createPeerConnection = (stream) => {
    if (peerConnection.current) return peerConnection.current;

    const pc = new RTCPeerConnection(servers);

    // add tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // receive remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // send ICE
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId: groupId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  // =========================
  // 📡 CREATE OFFER
  // =========================
  const createOffer = async () => {
    if (!localStream) return;

    const pc = createPeerConnection(localStream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", { roomId: groupId, offer });
  };

  // =========================
  // 🔌 SOCKET EVENTS
  // =========================
  useEffect(() => {
    if (!groupId) return;

    let stream;

    const setup = async () => {
      // join rooms
      socket.emit("joinRoom", groupId);
      socket.emit("joinUserRoom", user?._id);

      // start camera first
      stream = await initMedia();
    };

    setup();

    // ===== USER JOINED =====
    socket.on("userJoined", () => {
      createOffer();
    });

    // ===== OFFER =====
    socket.on("offer", async ({ offer }) => {
      const stream = localStream || (await initMedia());

      const pc = createPeerConnection(stream);

      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", { roomId: groupId, answer });
    });

    // ===== ANSWER =====
    socket.on("answer", async ({ answer }) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(answer);
    });

    // ===== ICE =====
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnection.current?.addIceCandidate(candidate);
      } catch (err) {
        console.error("ICE error:", err);
      }
    });

    // ===== CHAT =====
    socket.on("chatMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("userJoined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("chatMessage");

      peerConnection.current?.close();
      peerConnection.current = null;

      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [groupId]);

  // =========================
  // 🎛 CONTROLS
  // =========================
  const toggleMute = () => {
    const track = localStream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  };

  const toggleCamera = () => {
    const track = localStream?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsCameraOff(!track.enabled);
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      const sender = peerConnection.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");

      sender?.replaceTrack(screenTrack);

      screenTrack.onended = () => {
        const videoTrack = localStream?.getVideoTracks()[0];
        sender?.replaceTrack(videoTrack);
      };
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const data = {
      roomId: groupId,
      user: user?.name || "User",
      text: chatInput,
    };

    socket.emit("chatMessage", data);
    setMessages((prev) => [...prev, data]);
    setChatInput("");
  };

  const leaveMeeting = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    peerConnection.current?.close();
    navigate("/group-study");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">

      {/* HEADER */}
      <div className="flex justify-between p-4 bg-gray-800">
        <h2>Meeting Room</h2>
        <button onClick={leaveMeeting} className="bg-red-600 px-3 py-1 rounded">
          Leave
        </button>
      </div>

      <div className="flex flex-1">

        {/* VIDEO */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <video ref={localVideoRef} autoPlay muted className="w-80 bg-black rounded" />
          <video ref={remoteVideoRef} autoPlay className="w-80 bg-black rounded" />
        </div>

        {/* CHAT */}
        <div className="w-80 bg-gray-800 p-3 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i}>
                <b>{m.user}:</b> {m.text}
              </div>
            ))}
          </div>

          <div className="flex mt-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 text-black px-2"
            />
            <button onClick={sendMessage} className="bg-blue-500 px-3">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex justify-center gap-3 p-3 bg-gray-800">
        <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
        <button onClick={toggleCamera}>{isCameraOff ? "Camera On" : "Camera Off"}</button>
        <button onClick={shareScreen}>Share Screen</button>
      </div>
    </div>
  );
};

export default Meeting;