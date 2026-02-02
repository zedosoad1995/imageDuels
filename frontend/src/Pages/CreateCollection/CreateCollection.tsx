import {
  Button,
  Stack,
  Textarea,
  TextInput,
  Title,
  NumberInput,
  Checkbox,
  Group,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { ModeSelect } from "../../Components/ModeSelect/ModeSelect";
import { CollectionModeType } from "../../Types/collection";
import { createCollection } from "../../Api/collections";
import { useNavigate, useLocation } from "react-router";
import { Switch } from "../../Components/Switch/Switch";
import { usePage } from "../../Hooks/usePage";
import { useMediaQuery } from "@mantine/hooks";
import { MEDIA_QUERY_DESKTOP } from "../../Utils/breakpoints";

export const CreateCollection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  usePage("create-collection");
  const isDesktop = useMediaQuery(MEDIA_QUERY_DESKTOP);

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<CollectionModeType>(
    CollectionModeType.PUBLIC
  );
  const [isNSFW, setIsNSFW] = useState(false);
  const [votesPerImage, setVotesPerImage] = useState<number | null>(1);
  const [isUnlimitedVotes, setIsUnlimitedVotes] = useState(false);

  // Update votes per image based on mode
  useEffect(() => {
    if (mode === CollectionModeType.PUBLIC) {
      setVotesPerImage(1);
      setIsUnlimitedVotes(false);
    } else if (mode === CollectionModeType.PRIVATE) {
      setVotesPerImage(1);
      setIsUnlimitedVotes(false);
    } else if (mode === CollectionModeType.PERSONAL) {
      setIsUnlimitedVotes(true);
      setVotesPerImage(null);
    }
  }, [mode]);

  const handleChange =
    (setValue: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    };

  const handleChangeSwitch =
    (setValue: React.Dispatch<React.SetStateAction<boolean>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.checked);
    };

  const handleChangeDescription = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.currentTarget.value);
  };

  const handleModeChange = (value: string) => {
    setMode(value as CollectionModeType);
  };

  const handleClickCreate = async () => {
    const collection = await createCollection({
      mode,
      title,
      description,
      question,
      isNSFW,
      maxUserVotesPerImage: isUnlimitedVotes ? null : votesPerImage,
    });

    navigate(`/collections/${collection.id}`, {
      state: { from: location.pathname },
    });
  };

  return (
    <>
      {isDesktop && (
        <Title order={2} pb="sm">
          New Collection
        </Title>
      )}
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
        {mode === CollectionModeType.PUBLIC ? (
          <NumberInput
            label="Votes per image"
            value={1}
            max={200}
            min={1}
            disabled
            descriptionProps={{ style: { width: "max-content" } }}
            w={400}
            description="Public collections require 1 vote per image. This is an approximation - the system may collect more votes per image to optimize the matching algorithm."
          />
        ) : (
          <Stack gap="xs">
            <Group gap="md" align="flex-end" wrap="nowrap">
              <div style={{ position: "relative" }}>
                <NumberInput
                  label="Votes per image"
                  description="This is an approximation - the system may collect more votes per
            image to optimize the matching algorithm."
                  value={votesPerImage ?? undefined}
                  onChange={(value) =>
                    setVotesPerImage(typeof value === "number" ? value : null)
                  }
                  disabled={isUnlimitedVotes}
                  max={200}
                  min={1}
                  placeholder={isUnlimitedVotes ? "Unlimited" : "1"}
                  descriptionProps={{ style: { width: "max-content" } }}
                  w={200}
                />
              </div>
              <Checkbox
                label="Unlimited votes"
                checked={isUnlimitedVotes}
                styles={{ input: { cursor: "pointer" } }}
                onChange={(e) => {
                  setIsUnlimitedVotes(e.currentTarget.checked);
                  if (e.currentTarget.checked) {
                    setVotesPerImage(null);
                  } else {
                    setVotesPerImage(1);
                  }
                }}
                style={{
                  marginBottom: 8,
                }}
              />
            </Group>
          </Stack>
        )}
        <Switch
          label="NSFW content (+18)"
          checked={isNSFW}
          onChange={handleChangeSwitch(setIsNSFW)}
        />
        <Group mt="md" gap="sm">
          <Button onClick={handleClickCreate} fullWidth={false}>
            Create
          </Button>
        </Group>
      </Stack>
    </>
  );
};
