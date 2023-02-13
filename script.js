import Skylink, { SkylinkEventManager, SkylinkConstants, SkylinkEvents, SkylinkLogger } from "https://cdn.temasys.io/skylink/skylinkjs/2.4.0.1/skylink.complete.js"

const initOptions = {
  appKey: '474e3b65-6075-45b7-838b-6a211813cb7d', // Get your own key at https://console.temasys.io
  defaultRoom: 'temasys-codepen-2.x-safari'//getRoomId();
}

let skylink;

try {
  skylink = new Skylink(initOptions)
  SkylinkLogger.setLevel(SkylinkLogger.logLevels.TRACE);
  console.log(skylink.getSdkVersion());
  document.getElementById('status').innerHTML = 'Room information has been loaded. Room is ready for user to join.';
    document.getElementById('start').style.display = 'block';
} catch (err) {
  document.getElementById('status').innerHTML = 'Failed retrieval for room information.<br>Error: ' + (err.message || err.error);
}

SkylinkEventManager.addEventListener(SkylinkEvents.MEDIA_ACCESS_SUCCESS, (evt) => {
  console.log("MEDIA_ACCESS_SUCCESS", evt);
  let vid;
  let aud;
  const { isVideo, isAudio, stream } = evt.detail;
  if  (isVideo) {
    vid = document.getElementById('myvideo');
    attachMediaStream(vid, stream);
       setTimeout(() => {
    vid.controls = false;
  }, 1000);
  } else {
    aud = document.getElementById('myaudio');
    attachMediaStream(aud, stream);
       setTimeout(() => {
    aud.controls = false;
  }, 1000);
  }
})

SkylinkEventManager.addEventListener(SkylinkEvents.READY_STATE_CHANGE, (evt) => {
  console.log("READY_STATE_CHANGE", evt);
})

SkylinkEventManager.addEventListener(SkylinkEvents.PEER_JOINED, (evt) => {
  console.log("PEER_JOINED", evt);
  const { isSelf, peerId } = evt.detail;
  if(isSelf) return; // We already have a video element for our video and don't need to create a new one.
  const vid = document.createElement('video');
  vid.autoplay = true;
  vid.controls = true;
  vid.setAttribute('playsinline', true);
  vid.id = `${peerId}_video`;
  document.body.appendChild(vid);
  
  const aud = document.createElement('audio');
  aud.autoplay = true;
  aud.controls = true;
  aud.setAttribute('playsinline', true);
  aud.id = `${peerId}_audio`;
  document.body.appendChild(aud);
  
  setTimeout(() => {
    aud.controls = false;
    vid.controls = false;
  }, 1000);
})

SkylinkEventManager.addEventListener(SkylinkEvents.ON_INCOMING_STREAM, (evt) => {
  const { isSelf, peerId, stream, isAudio, isVideo } = evt.detail;
  if(isSelf) return;
  console.log("ON_INCOMING_STREAM", evt, evt.detail.stream.getTracks()[0]);
  if  (isVideo) {
      const vid = document.getElementById(`${peerId}_video`);
      attachMediaStream(vid, stream);
  } else if (isAudio) {
      const aud = document.getElementById(`${peerId}_audio`);
      attachMediaStream(aud, stream);
  } else {
    console.error("Stream kind not recognized");
  }
})

SkylinkEventManager.addEventListener(SkylinkEvents.PEER_LEFT, (evt) => {
  console.log("PEER_LEFT", evt);
  const { peerId } = evt.detail;
  const vid = document.getElementById(`${peerId}_video`);
  document.body.removeChild(vid);
  const aud = document.getElementById(`${peerId}_audio`);
  document.body.removeChild(aud);
})

document.getElementById("start_btn").addEventListener("click", () => {
  event.target.style.visibility = 'hidden';
  
  skylink.joinRoom({
    audio: true,
    video: true
  })
  .then((streams) => {
    document.getElementById('status').innerHTML = 'Joined room.';
  })
    .catch((err) => {
   document.getElementById('status').innerHTML = 'Failed joining room.<br>' +
  'Error: ' + (err.message || err.error);
  });
})

/* Helper functions */

function getRoomId() {
  var roomId = document.cookie.match(/roomId=([a-z0-9-]{36})/);
  if(roomId) {
    return roomId[1];
  }
  else {
    roomId = skylink.generateUUID();
    var date = new Date();
    date.setTime(date.getTime() + (30*24*60*60*1000));
    document.cookie = 'roomId=' + roomId + '; expires=' + date.toGMTString() + '; path=/';
    return roomId;
  }
};
