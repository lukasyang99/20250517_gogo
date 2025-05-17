const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const message = document.getElementById('message');

let model;

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

function checkObjects(predictions) {
  let status = "안전";

  for (let p of predictions) {
    const className = p.class.toLowerCase();

    if (["person", "cat", "dog"].includes(className)) {
      status = "정지";
      break;
    }

    if (className.includes("traffic light")) {
      // 그냥 신호등만 감지하면 색 정보는 없으므로, 색상 감지는 불가능함
      // (색 분석하려면 다른 모델 또는 색상 처리 필요)
      status = "정지 또는 서행 (신호 분석 불가)";
    }
  }

  message.textContent = status;
}

async function detectFrame() {
  const predictions = await model.detect(video);

  // 캔버스 초기화
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  predictions.forEach(p => {
    const [x, y, width, height] = p.bbox;
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(p.class, x, y > 10 ? y - 5 : y + 20);
  });

  checkObjects(predictions);
  requestAnimationFrame(detectFrame);
}

async function main() {
  await setupCamera();
  video.play();

  model = await cocoSsd.load();
  detectFrame();
}

main();


