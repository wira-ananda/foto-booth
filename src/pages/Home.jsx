function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>📸 Welcome to Photo Booth</h1>
      <p>Click below to start!</p>
      <a href="/camera">
        <button style={{ padding: "10px 20px", fontSize: "18px" }}>
          Start Booth
        </button>
      </a>
    </div>
  );
}

export default Home;
