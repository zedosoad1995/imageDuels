import {
  Button,
  Stack,
  Text,
  Textarea,
  TextInput,
  NumberInput,
  Radio,
  Group,
} from "@mantine/core";
import { IGetCollection } from "../../../../Types/collection";
import { ModeSelect } from "../../../../Components/ModeSelect/ModeSelect";
import { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { deleteCollection, editCollection } from "../../../../Api/collections";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editCollectionSchema,
  EditCollectionType,
} from "../../../../Schemas/Collection/editCollectionSchema";
import { CollectionContext } from "../../../../Contexts/CollectionContext";
import { UserContext } from "../../../../Contexts/UserContext";
import { Switch } from "../../../../Components/Switch/Switch";
import { CollectionModeType } from "../../../../Types/collection";

interface Props {
  collection: IGetCollection;
}

export const About = ({ collection }: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCollection } = useContext(CollectionContext);
  const { user } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(false);
  const [votesPerImage, setVotesPerImage] = useState<number | null>(1);
  const [isUnlimitedVotes, setIsUnlimitedVotes] = useState(false);

  const {
    register,
    control,
    getValues,
    watch,
    formState: { isValid },
  } = useForm<EditCollectionType>({
    resolver: zodResolver(editCollectionSchema),
    defaultValues: {
      title: collection.title,
      description: collection.description ?? "",
      question: collection.question ?? "",
      mode: collection.mode,
      isNSFW: collection.isNSFW,
      maxUserVotesPerImage: collection.maxUserVotesPerImage || null,
    },
  });

  const mode = watch("mode");

  // Update votes per image based on mode
  useEffect(() => {
    if (mode === CollectionModeType.PUBLIC) {
      const isSameMode = collection.mode === CollectionModeType.PUBLIC;

      setVotesPerImage(isSameMode ? collection.maxUserVotesPerImage ?? 1 : 1);
      setIsUnlimitedVotes(false);
    } else if (mode === CollectionModeType.PRIVATE) {
      const isSameMode = collection.mode === CollectionModeType.PRIVATE;

      setVotesPerImage(isSameMode ? collection.maxUserVotesPerImage : 1);
      setIsUnlimitedVotes(
        isSameMode ? collection.maxUserVotesPerImage === null : false
      );
    } else if (mode === CollectionModeType.PERSONAL) {
      const isSameMode = collection.mode === CollectionModeType.PERSONAL;

      setVotesPerImage(isSameMode ? collection.maxUserVotesPerImage : null);
      setIsUnlimitedVotes(
        isSameMode ? collection.maxUserVotesPerImage === null : true
      );
    }
  }, [mode, collection.mode, collection.maxUserVotesPerImage]);

  const handleClickEdit = async () => {
    if (!id) {
      return;
    }

    const { title, description, mode, question, isNSFW } = getValues();

    try {
      setIsLoading(true);
      await editCollection(id, {
        title,
        description,
        mode,
        question,
        isNSFW,
        maxUserVotesPerImage: isUnlimitedVotes ? null : votesPerImage,
      });
      setCollection((val) =>
        val
          ? {
              ...val,
              title,
              description,
              mode,
              question,
              isNSFW,
              maxUserVotesPerImage: isUnlimitedVotes ? null : votesPerImage,
            }
          : undefined
      );
      notifications.show({ message: "Collection edited successfully" });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: "Delete collection",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this collection? This action is
          irreversible.
        </Text>
      ),
      labels: { confirm: "Delete collection", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: handleClickDelete,
    });

  const handleClickDelete = async () => {
    if (!id) {
      return;
    }

    await deleteCollection(id);
    navigate("/");
    notifications.show({ message: "Collection deleted" });
  };

  // The edit button is kinda lame, especially when changing the switch. Maybe change it

  if (!collection.belongsToMe) {
    if (user?.role === "ADMIN") {
      return (
        <Stack>
          <Controller
            name="isNSFW"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                label="NSFW content (+18)"
                checked={value}
                onChange={onChange}
              />
            )}
          />

          <Group mt="md" gap="sm">
            <Button
              onClick={handleClickEdit}
              loading={isLoading}
              disabled={!isValid}
            >
              Save
            </Button>
            <Button onClick={openDeleteModal} color="red">
              Delete
            </Button>
          </Group>
        </Stack>
      );
    }

    return (
      <>
        {collection.question && <Text>Question: {collection.question}</Text>}
        {collection.description && (
          <Text style={{ lineBreak: "anywhere", whiteSpace: "pre-wrap" }}>
            {collection.description}
          </Text>
        )}
      </>
    );
  }

  return (
    <Stack>
      <TextInput
        label="Title"
        placeholder="Title"
        required
        {...register("title")}
      />
      <TextInput
        label="Question"
        placeholder="Question"
        {...register("question")}
      />
      <Textarea
        label="Description"
        placeholder="Description"
        {...register("description")}
      />
      <Controller
        name="mode"
        control={control}
        render={({ field: { value, onChange } }) => (
          <ModeSelect value={value} onChange={onChange} />
        )}
      />

      {mode === CollectionModeType.PUBLIC ? (
        <NumberInput
          label="Votes per image"
          value={1}
          max={200}
          min={1}
          disabled
          styles={{
            wrapper: {
              width: 400,
            },
          }}
          description="Public collections require 1 vote per image. This is an approximation - the system may collect more votes per image to optimize the matching algorithm."
        />
      ) : (
        <Radio.Group
          label="Votes per image"
          value={isUnlimitedVotes ? "unlimited" : "limited"}
          onChange={(value) => {
            if (value === "unlimited") {
              setIsUnlimitedVotes(true);
              setVotesPerImage(null);
            } else {
              setIsUnlimitedVotes(false);
              setVotesPerImage(1);
            }
          }}
        >
          <Stack gap="xs" mt="xs">
            <Radio value="limited" label="Limited" />
            <div style={{ marginLeft: 24 }}>
              <NumberInput
                description="This is an approximation - the system may collect more votes per image to optimize the matching algorithm."
                value={votesPerImage ?? undefined}
                onChange={(value) =>
                  setVotesPerImage(typeof value === "number" ? value : null)
                }
                disabled={isUnlimitedVotes}
                max={200}
                min={1}
                placeholder="1"
                styles={{
                  wrapper: {
                    width: 200,
                  },
                }}
              />
            </div>
            <Radio value="unlimited" label="Unlimited" />
          </Stack>
        </Radio.Group>
      )}

      <Controller
        name="isNSFW"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Switch
            label="NSFW content (+18)"
            checked={value}
            onChange={onChange}
          />
        )}
      />

      <Group mt="md" gap="sm">
        <Button
          onClick={handleClickEdit}
          loading={isLoading}
          disabled={!isValid}
        >
          Save
        </Button>
        <Button onClick={openDeleteModal} color="red">
          Delete
        </Button>
      </Group>
    </Stack>
  );
};
