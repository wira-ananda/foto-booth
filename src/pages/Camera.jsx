import { useRef, useEffect, useState } from "react";

function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [finalStrip, setFinalStrip] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [takingPhotos, setTakingPhotos] = useState(false);

  const [photoCount, setPhotoCount] = useState(3); // default 3 foto
  const [photos, setPhotos] = useState([]); // simpan hasil foto sementara
  const [background, setBackground] = useState(null); // background custom

  // 🔹 Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // 🔹 Stop camera
  const stopCamera = () => {
    let stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // 🔹 Nyalain kamera pertama kali
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // 🔹 Capture foto sekali
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  // 🔹 Ambil foto sesuai jumlah
  const startBooth = async () => {
    setTakingPhotos(true);
    let newPhotos = [];

    for (let i = 0; i < photoCount; i++) {
      // countdown 3..2..1
      await new Promise((resolve) => {
        let counter = 3;
        setCountdown(counter);
        const interval = setInterval(() => {
          counter--;
          if (counter === 0) {
            clearInterval(interval);
            setCountdown(null);
            const photo = capturePhoto();
            newPhotos.push(photo);
            setPhotos([...newPhotos]); // update preview
            resolve();
          } else {
            setCountdown(counter);
          }
        }, 1000);
      });

      // jeda 1 detik antar foto
      await new Promise((res) => setTimeout(res, 1000));
    }

    setTakingPhotos(false);
  };

  // 🔹 Retake salah satu foto
  const retakePhoto = async (index) => {
    return new Promise((resolve) => {
      let counter = 3;
      setCountdown(counter);
      const interval = setInterval(() => {
        counter--;
        if (counter === 0) {
          clearInterval(interval);
          setCountdown(null);
          const photo = capturePhoto();
          setPhotos((prev) => {
            const updated = [...prev];
            updated[index] = photo; // ganti foto tertentu
            return updated;
          });
          resolve();
        } else {
          setCountdown(counter);
        }
      }, 1000);
    });
  };

  // 🔹 Gabungkan foto + background
  const createStrip = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const imgWidth = 1255; // kamu bisa atur lebar (misalnya A4 print 1800px)
    const imgHeight = 610; // tinggi tiap foto
    const totalHeight = 2600; // tinggi total sesuai permintaan
    const topOffset = 250; // jarak dari atas sebelum foto pertama

    canvas.width = imgWidth;
    canvas.height = totalHeight;

    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });

    // load semua foto
    const images = await Promise.all(photos.map((p) => loadImage(p)));

    // gambar foto ke bawah dengan jarak offset
    images.forEach((img, i) => {
      const yPos = topOffset + i * imgHeight; // geser 360px dari atas
      ctx.drawImage(img, 0, yPos, imgWidth, imgHeight);
    });

    // load background dulu
    if (background) {
      const bgImg = await loadImage(background);
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
      // fallback background putih
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setFinalStrip(canvas.toDataURL("image/png")); // ✅ hasil langsung muncul
  };

  // 🔹 Upload background custom
  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBackground(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Print hasil
  const printStrip = () => {
    const win = window.open();
    win.document.write(`<img src="${finalStrip}" style="width:300px"/>`);
    win.print();
    win.close();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>📸 Photo Booth</h2>

      {/* opsi jumlah foto */}
      {!finalStrip && !takingPhotos && photos.length === 0 && (
        <div style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="radio"
              value={1}
              checked={photoCount === 1}
              onChange={() => setPhotoCount(1)}
            />{" "}
            1 Foto
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              value={2}
              checked={photoCount === 2}
              onChange={() => setPhotoCount(2)}
            />{" "}
            2 Foto
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              value={3}
              checked={photoCount === 3}
              onChange={() => setPhotoCount(3)}
            />{" "}
            3 Foto
          </label>
        </div>
      )}

      {/* upload background */}
      {!finalStrip && photos.length === 0 && (
        <div style={{ marginBottom: "10px" }}>
          <label>
            Pilih Background:{" "}
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
            />
          </label>
        </div>
      )}

      {/* live camera */}
      {!finalStrip && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "400px",
            border: "2px solid black",
            borderRadius: "10px",
          }}
        />
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* countdown */}
      {countdown && (
        <h1 style={{ fontSize: "80px", color: "red", marginTop: "10px" }}>
          {countdown}
        </h1>
      )}

      {/* preview foto sebelum final */}
      {photos.length > 0 && !finalStrip && (
        <div style={{ marginTop: "20px" }}>
          <h3>📷 Preview Foto</h3>
          {photos.map((p, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <img
                src={p}
                alt={`Foto ${i + 1}`}
                style={{
                  width: "200px",
                  border: "2px solid black",
                  borderRadius: "5px",
                }}
              />
              <br />
              <button onClick={() => retakePhoto(i)}>
                Retake Foto {i + 1}
              </button>
            </div>
          ))}
          <button
            onClick={createStrip}
            style={{ marginTop: "20px", padding: "10px 20px" }}
          >
            Buat Strip Final
          </button>
        </div>
      )}

      {/* hasil */}
      {finalStrip && (
        <div style={{ marginTop: "20px" }}>
          <h3>🎉 Final Photo Strip</h3>
          <img
            src={finalStrip}
            alt="Final Strip"
            style={{ border: "3px solid black", borderRadius: "10px" }}
          />
          <br />
          <a href={finalStrip} download="photobooth.png">
            <button style={{ margin: "10px" }}>Download</button>
          </a>
          <button onClick={printStrip} style={{ margin: "10px" }}>
            Print
          </button>
          <button
            onClick={() => {
              setFinalStrip(null);
              setPhotos([]); // reset semua
              stopCamera();
              setTimeout(() => startCamera(), 300); // nyalain lagi
            }}
            style={{ margin: "10px" }}
          >
            Retake Semua
          </button>
        </div>
      )}

      {/* tombol mulai */}
      {!finalStrip && !takingPhotos && photos.length === 0 && (
        <button
          onClick={startBooth}
          style={{ marginTop: "20px", padding: "10px 20px" }}
        >
          Start Booth
        </button>
      )}
    </div>
  );
}

export default Camera;
