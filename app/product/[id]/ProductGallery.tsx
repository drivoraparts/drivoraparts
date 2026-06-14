"use client";

export default function ProductGallery({
  product,
}: {
  product: any;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* MAIN IMAGE */}
      <div
        style={{
          height: 350,
          background: "#000",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <img
          src={product.images?.[0]}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* THUMBNAILS */}
      <div style={{ display: "flex", gap: 10 }}>
        {product.images?.map((img: string, i: number) => (
          <img
            key={i}
            src={img}
            style={{
              width: 90,
              height: 90,
              objectFit: "cover",
              borderRadius: 10,
              border: "1px solid #222",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}