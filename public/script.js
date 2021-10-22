const socket = io("/");
const videoGrid = document.getElementById("video-grid");
// const myPeer = new Peer(undefined, {
//   host: "/",
//   port: 3001,
// });
const myPeer = new Peer();
const peers = {};
const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // stream is a video or a audio.
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectedToNewUser(userId, stream);
    });
  });

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("User connected:" + userId);
});

socket.on("user-disconnected", (userId) => {
  peers[userId]?.close();
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectedToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  call.on("stream", (userVideoStream) => {
    const video = document.createElement("video");
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peer[userId] = call;
}
