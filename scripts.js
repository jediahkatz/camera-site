// Adapted from https://codepen.io/s5b/project/editor/ZmqneL
const video = document.querySelector('#video')
const canvas = document.querySelector('#photo')
const ctx = canvas.getContext('2d')

// Fix for iOS Safari from https://leemartin.dev/hello-webrtc-on-safari-11-e8bcb5335295
video.setAttribute('autoplay', '')
video.setAttribute('muted', '')
video.setAttribute('playsinline', '')

const constraints = {
  audio: false,
  video: {
    facingMode: 'user'
  }
}

function getVideo() {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(localMediaStream => {
      if ('srcObject' in video) {
        video.srcObject = localMediaStream
      } else {
        video.src = URL.createObjectURL(localMediaStream)
      }
      video.play()
    })
    .catch(err => {
      console.error('Error loading video:', err)
    })
}

function paintToCanvas() {
  const width = video.videoWidth
  const height = video.videoHeight
  canvas.width = width
  canvas.height = height

  // Blit the <video> to the <canvas> every 16ms
  // so that we can capture it as a still photo
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height)
  }, 16)
}

function changeToThanksPage() {
  const cameraPage = document.getElementById('camera-page')
  const thanksPage = document.getElementById('thanks-page')
  cameraPage.parentElement.removeChild(cameraPage)
  thanksPage.style.visibility = 'visible'
}

function takePhotoAndUpload() {
  // Extract current image data from the canvas
  let API_URL = 'https://whgvo3ae9f.execute-api.us-east-2.amazonaws.com/default/upload-pixel-me'
  // API_URL = 'http://localhost:8000'
  const dataURL = canvas.toDataURL('image/jpeg')
  const data = dataURL.substring(dataURL.search(',')+1)
  console.log('Got image data, uploading...')
  fetch(API_URL, {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/octet-stream',
      'Origin': 'http://localhost:8000',
      'Access-Control-Allow-Origin': '*'
    },
    'body': JSON.stringify({
      'content': data
    })
  }).then((res) => {
    console.log(res)
  }).catch(reason => {
    console.log('Error:', reason)
  })

  changeToThanksPage()
}

getVideo()

video.addEventListener('canplay', paintToCanvas)