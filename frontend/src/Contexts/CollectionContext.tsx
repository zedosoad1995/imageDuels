import React, { createContext, useEffect, useState } from "react";
import { IGetCollection } from "../Types/collection";
import { getCollection } from "../Api/collections";

interface CollectionProviderProps {
  children: React.ReactNode;
  collectionId: string | undefined;
}

interface CollectionContextProps {
  collection: IGetCollection | undefined;
  setCollection: React.Dispatch<
    React.SetStateAction<IGetCollection | undefined>
  >;
  isLoading: boolean;
  fetchCollection: () => Promise<void>;
}

export const CollectionContext = createContext<CollectionContextProps>({
  collection: undefined,
  setCollection: () => {},
  isLoading: false,
  fetchCollection: async () => {},
});

export const CollectionProvider = ({
  children,
  collectionId,
}: CollectionProviderProps) => {
  const [collection, setCollection] = useState<IGetCollection>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchCollection = async () => {
    if (!collectionId) {
      return;
    }

    try {
      setIsLoading(true);
      await getCollection(collectionId).then(setCollection);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [collectionId]);

  return (
    <CollectionContext.Provider
      value={{ collection, setCollection, isLoading, fetchCollection }}
    >
      {children}
    </CollectionContext.Provider>
  );
};
