import { Button, Stack, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";
import { Mode } from "./Components/Mode";
import { CollectionModeType } from "../../Types/collection";
import { createCollection } from "../../Api/collections";

export const CreateCollection = () => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<CollectionModeType>("PUBLIC");

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

  const handleClickCreate = () => {
    createCollection({
      mode,
      title,
      description,
      question,
    });
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
      <Mode value={mode} onChange={handleModeChange} />
      <Button onClick={handleClickCreate}>Create</Button>
    </Stack>
  );
};
