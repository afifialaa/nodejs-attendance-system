navigator.mediaDevices.getUserMedia({video: true})
  .then(gotMedia)
  .catch(error => console.error('getUserMedia() error:', error));

function gotMedia(mediaStream) {
  const mediaStreamTrack = mediaStream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(mediaStreamTrack);
  console.log(imageCapture);

  const img = document.querySelector('img');
  // ...
  imageCapture.takePhoto()
    .then(blob => {
      img.src = URL.createObjectURL(blob);
      img.onload = () => { URL.revokeObjectURL(this.src); }
      uploadToServer(blob);
    })
    .catch(error => console.error('takePhoto() error:', error));
}

function uploadToServer(blob){
  console.log('uploadToServer invoked')
  var http = new XMLHttpRequest();
  http.open("POST", '/upload', true);
  http.setRequestHeader("Content-Type", "application/octet-stream");
  http.onreadystatechange = function() { // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
    }
  }
  http.send('blob=' + blob);
}

