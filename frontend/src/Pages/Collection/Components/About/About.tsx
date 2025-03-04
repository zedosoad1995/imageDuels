import { Button, Stack, Text, Textarea, TextInput } from "@mantine/core";
import {
  CollectionModeType,
  IGetCollection,
} from "../../../../Types/collection";
import { ModeSelect } from "../../../../Components/ModeSelect/ModeSelect";
import { useState } from "react";
import { useParams } from "react-router";
import { editCollection } from "../../../../Api/collections";
import { notifications } from "@mantine/notifications";

interface Props {
  collection: IGetCollection;
}

export const About = ({ collection }: Props) => {
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(collection.title);
  const [question, setQuestion] = useState(collection.question ?? "");
  const [description, setDescription] = useState(collection.description ?? "");
  const [mode, setMode] = useState(collection.mode);

  if (!collection.belongsToMe) {
    return (
      <>
        {collection.question && <Text>Question: {collection.question}</Text>}
        {collection.description && (
          <Text>Description: {collection.description}</Text>
        )}
      </>
    );
  }

  const handleChange =
    (setValue: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    };

  const handleChangeDescription = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.currentTarget.value);
  };

  const handleModeChange = (value: string) => {
    setMode(value as CollectionModeType);
  };

  const handleClickEdit = async () => {
    if (!id) {
      return;
    }

    try {
      setIsLoading(true);
      await editCollection(id, { title, description, mode, question });
      notifications.show({ message: "Collection edited successfully" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack>
      <TextInput
        label="Title"
        placeholder="Title"
        value={title}
        onChange={handleChange(setTitle)}
        required
      />
      <TextInput
        label="Question"
        placeholder="Question"
        value={question}
        onChange={handleChange(setQuestion)}
      />
      <Textarea
        label="Description"
        placeholder="Description"
        value={description}
        onChange={handleChangeDescription}
      />
      <ModeSelect value={mode} onChange={handleModeChange} />
      <Button onClick={handleClickEdit} loading={isLoading}>
        Edit
      </Button>
    </Stack>
  );
};
