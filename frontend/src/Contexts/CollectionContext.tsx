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
  fetchCollection: (options?: {
    useCursor?: boolean;
    orderBy?: "new" | "best-rated" | "worst-rated";
  }) => Promise<void>;
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
  const [currentOrderBy, setCurrentOrderBy] = useState<
    "new" | "best-rated" | "worst-rated"
  >("best-rated");

  const fetchCollection = async (
    options: {
      useCursor?: boolean;
      orderBy?: "new" | "best-rated" | "worst-rated";
    } = {}
  ) => {
    if (!collectionId) {
      return;
    }

    const orderBy = options.orderBy ?? currentOrderBy;
    if (options.orderBy && options.orderBy !== currentOrderBy) {
      setCurrentOrderBy(options.orderBy);
    }

    let cursor: string | null | undefined;
    if (options.useCursor) {
      cursor = collection?.nextCursor;
    }

    try {
      setIsLoading(true);
      const collectionRes = await getCollection(collectionId, cursor, orderBy);

      if (options.useCursor) {
        setCollection((curr) => ({
          ...collectionRes,
          images: [...(curr?.images ?? []), ...collectionRes.images],
        }));
      } else {
        setCollection(collectionRes);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentOrderBy("best-rated");
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
