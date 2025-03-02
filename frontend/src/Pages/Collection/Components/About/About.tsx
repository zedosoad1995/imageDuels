import { Text } from "@mantine/core";
import { IGetCollection } from "../../../../Types/collection";

interface Props {
  collection: IGetCollection;
}

export const About = ({ collection }: Props) => {
  return (
    <>
      {collection.question && <Text>Question: {collection.question}</Text>}
      {collection.description && (
        <Text>Description: {collection.description}</Text>
      )}
    </>
  );
};
