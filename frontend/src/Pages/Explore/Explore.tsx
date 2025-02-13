import { useEffect, useState } from "react";
import { getCollections, IGetCollections } from "../../Api/collections";
import classes from "./Explore.module.css";
import { useNavigate } from "react-router";

export const Explore = () => {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<IGetCollections>([]);

  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

  const handleClickCollection = (id: string) => () => {
    navigate(`/collection/${id}`);
  };

  return (
    <>
      {collections.map(({ id, title, description, question }) => (
        <div
          key={id}
          className={classes.card}
          onClick={handleClickCollection(id)}
        >
          <p>{title}</p>
          <p>{description}</p>
          <p>{question}</p>
        </div>
      ))}
    </>
  );
};
