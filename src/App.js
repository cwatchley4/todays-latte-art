// Source

import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [art, setArt] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getArt() {
        setIsLoading(true);

        let query = supabase.from("art").select("*");

        if (currentCategory !== "all")
          query = query.eq("category", currentCategory);

        const { data: art, error } = await query
          .order("created_at", { ascending: false })
          .limit(1000);

        if (!error) setArt(art);
        else alert("There was a problem getting data.");
        setArt(art);
        setIsLoading(false);
      }
      getArt();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? (
        <NewArtForm setArt={setArt} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />

        {isLoading ? <Loader /> : <ArtList art={art} setArt={setArt} />}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Today's Latte Art";

  return (
    <header className="header">
      <div className="logo">
        <h1>☕️</h1>
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large btn-post"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a picture"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "espresso", color: "#3b82f6" },
  { name: "lattes", color: "#16a34a" },
  { name: "cortados", color: "#ef4444" },
  { name: "cappuccinos", color: "#eab308" },
];

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewArtForm({ setArt, setShowForm }) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null); // State to store the selected image file
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitting form...");

    console.log("Checking validity:", text, name, category, text.length <= 200);

    if (text && name && category && text.length <= 200) {
      setIsUploading(true);
      console.log("Form data is valid...");

      try {
        let newArt;

        const { data: file, error: fileError } = await supabase.storage
          .from("art-images")
          .upload(`art/${Date.now()}`, imageFile);

        console.log("Uploaded File:", file);

        if (fileError) {
          console.error("Error uploading image", fileError);
          throw fileError;
        }
        console.log("File Path:", file.path);
        const imageUrl = `https://ahzvwcyggypskspkfozy.supabase.co/storage/v1/object/public/${file.fullPath}`;

        // Check if imageUrl is not null or undefined before using it
        if (imageUrl) {
          ({ data: newArt } = await supabase
            .from("art")
            .insert([
              {
                text,
                name,
                category,
                image_url: imageUrl,
              },
            ])
            .select());
        } else {
          throw new Error("Image URL is null or undefined");
        }

        setIsUploading(false);

        if (newArt && newArt.length > 0) {
          setArt((art) => [newArt[0], ...art]);
          setText("");
          setName("");
          setCategory("");
          setImageFile(null);
          setShowForm(false);
        }
      } catch (error) {
        console.error("Error handling form submission", error);
        setIsUploading(false);
      }
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  return (
    <form className="art-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Tell us about your latte art..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Your name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      {/* Add file input for image upload */}
      <input
        type="file"
        onChange={handleImageChange}
        accept="image/*"
        disabled={isUploading}
      />
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function ArtList({ art, setArt }) {
  if (art.length === 0)
    return (
      <p className="message">
        No art for this category yet! Create the first one ☕️
      </p>
    );

  return (
    <section>
      <ul className="art-list">
        {art.map((art) => (
          <Art key={art.id} art={art} setArt={setArt} />
        ))}
      </ul>
      <p>There are {art.length} posts in the database. Add your own!</p>
    </section>
  );
}

function Art({ art, setArt }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  console.log("Image URL:", art.image_url);

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedArt, error } = await supabase
      .from("art")
      .update({ [columnName]: art[columnName] + 1 })
      .eq("id", art.id)
      .select();

    console.log(updatedArt);

    setIsUpdating(false);

    if (!error)
      setArt((art) =>
        art.map((a) => (a.id === updatedArt[0].id ? updatedArt[0] : a))
      );
  }

  useEffect(() => {
    const createdAtDate = new Date(art.created_at);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const formatted = new Intl.DateTimeFormat("en-US", options).format(
      createdAtDate
    );
    setFormattedDate(formatted);
  }, [art.created_at]);

  return (
    <li className="art">
      <p>
        {art.text}
        <span className="name"> - {art.name}</span>
      </p>
      {art.image_url && <img src={art.image_url} alt="Latte Art" />}
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === art.category)
            .color,
        }}
      >
        {art.category}
      </span>
      <span>{formattedDate}</span>
      <div className="vote-buttons">
        <button onClick={() => handleVote("votesMug")} disabled={isUpdating}>
          ☕️ {art.votesMug}
        </button>
        <button onClick={() => handleVote("votesHeart")} disabled={isUpdating}>
          ❤️ {art.votesHeart}
        </button>
        <button
          onClick={() => handleVote("votesMindBlown")}
          disabled={isUpdating}
        >
          🤯 {art.votesMindBlown}
        </button>
      </div>
    </li>
  );
}

export default App;
