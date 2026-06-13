export default function Home() {
  const categories = [
    "engines",
    "turbochargers",
    "ecu-modules",
    "transmissions",
    "headlights",
    "bumpers",
  ];

  return (
    <div
      style={{
        fontFamily: "Arial",
        background: "#0f0f0f",
        color: "white",
        minHeight: "100vh",
      }}
    >
      {/* NAVBAR */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid #222",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: "bold" }}>
          DrivoraParts
        </h1>

        <nav style={{ display: "flex", gap: "20px", fontSize: "14px" }}>
          <span>Home</span>
          <span>Catalog</span>
          <span>Contact</span>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ padding: "60px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: "40px", fontWeight: "bold" }}>
          Premium Engine Parts Marketplace
        </h2>

        <p style={{ marginTop: "10px", color: "#aaa" }}>
          USA • UK • Canada — Engines, Turbochargers, ECU Modules & More
        </p>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: "40px" }}>
        <h3 style={{ fontSize: "22px", marginBottom: "20px" }}>
          Categories
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "15px",
          }}
        >
          {categories.map((item) => (
            <a
              key={item}
              href={`/catalog/${item}`}
              style={{
                background: "#1a1a1a",
                padding: "20px",
                borderRadius: "10px",
                textAlign: "center",
                display: "block",
                color: "white",
                textDecoration: "none",
                textTransform: "capitalize",
              }}
            >
              {item.replace("-", " ")}
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "30px 40px",
          borderTop: "1px solid #222",
          marginTop: "60px",
          color: "#777",
        }}
      >
        Built with Next.js + Cloudflare Pages
      </footer>
    </div>
  );
}