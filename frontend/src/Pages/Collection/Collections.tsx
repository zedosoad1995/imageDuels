import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import {
  addImageToCollection,
  getCollection,
  ICollection,
} from "../../Api/collections";

export const Collection = () => {
  const { id } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [collection, setCollection] = useState<ICollection>();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !id) return;
    const file = e.target.files[0];
    try {
      const response = await addImageToCollection(id, file);
      console.log("Uploaded:", response);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    getCollection(id).then(setCollection).then();
  }, [id]);

  if (!collection) {
    return null;
  }

  return (
    <div>
      <h2>{collection.title}</h2>
      <button onClick={handleButtonClick}>Upload image</button>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        style={{ display: "none" }}
        accept=".jpg, .jpeg, .png, .webp"
      />
      {collection.question && <p>Question: {collection.question}</p>}
      {collection.description && <p>Description: {collection.description}</p>}
      {collection.images.map(({ id, filepath, numVotes }) => (
        <div key={id}>
          <img
            src={import.meta.env.VITE_IMAGES_URL + "/" + filepath}
            height={100}
          />
          <p>{numVotes} votes</p>
        </div>
      ))}
    </div>
  );
};
