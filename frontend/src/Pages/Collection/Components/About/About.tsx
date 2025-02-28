import { Text } from "@mantine/core";
import { ICollection } from "../../../../Api/collections";

interface Props {
  collection: ICollection;
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
