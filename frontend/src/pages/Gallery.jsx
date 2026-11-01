function Gallery() {
  const images = [
    "https://picsum.photos/seed/techfest1/300/200",
    "https://picsum.photos/seed/techfest2/300/200",
    "https://picsum.photos/seed/techfest3/300/200"
  ];

  return (
    <div className="page">
      <h1>Gallery</h1>
      <div className="gallery-grid">
        {images.map((src, index) => (
          <img key={index} src={src} alt={`TechFest 2026 gallery photo ${index + 1}`} width="300" height="200" loading="lazy" decoding="async" />
        ))}
      </div>
    </div>
  );
}

export default Gallery;
