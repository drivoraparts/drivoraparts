export default function Home() {
  return (
    <div style={{ fontFamily: "Arial", background: "#0f0f0f", color: "white", minHeight: "100vh" }}>
      
      {/* NAVBAR */}
      <header style={{ display: "flex", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid #222" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "bold" }}>
          DrivoraParts
        </h1>

        <nav style={{ display: "flex", gap: "20px", fontSize: "14px" }}>
          <span>Home</span>
          <span>Engines</span>
          <span>Turbo</span>
          <span>ECU</span>
          <span>Contact</span>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ padding: "60px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: "40px", fontWeight: "bold" }}>
          Premium Engine Parts Marketplace
        </h2>

        <p style={{ marginTop: "10px", color: "#aaa" }}>
          USA • UK • Canada — Performance engines, turbochargers, ECU modules & more
        </p>

        <div style={{ marginTop: "25px" }}>
          <input
            placeholder="Search engines, turbos, ECUs..."
            style={{
              padding: "12px",
              width: "300px",
              borderRadius: "8px",
              border: "none",
              outline: "none"
            }}
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: "40px" }}>
        <h3 style={{ fontSize: "22px", marginBottom: "20px" }}>
          Categories
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
          {["Engines", "Turbochargers", "ECU Modules", "Transmissions", "Headlights", "Bumpers"].map((item) => (
            <div
              key={item}
              style={{
                background: "#1a1a1a",
                padding: "20px",
                borderRadius: "10px",
                textAlign: "center",
                cursor: "pointer"
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "30px 40px", borderTop: "1px solid #222", marginTop: "60px", color: "#777" }}>
        Built with Next.js + Cloudflare Pages
      </footer>

    </div>
  );
}