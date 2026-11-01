import { useState, useEffect } from "react";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect with an empty array [] runs exactly ONE TIME, right after the page loads
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=3")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load announcements");
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1>Welcome to TechFest 2026</h1>
      <p>Three days of hackathons, workshops and competitions.</p>

      <h2>Announcements</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-msg">{error}</p>}
      {!loading && !error && (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;
