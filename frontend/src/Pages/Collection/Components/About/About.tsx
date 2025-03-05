import { Button, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { IGetCollection } from "../../../../Types/collection";
import { ModeSelect } from "../../../../Components/ModeSelect/ModeSelect";
import { useContext, useState } from "react";
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

interface Props {
  collection: IGetCollection;
}

export const About = ({ collection }: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCollection } = useContext(CollectionContext);

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    getValues,
    formState: { isValid },
  } = useForm<EditCollectionType>({
    resolver: zodResolver(editCollectionSchema),
    defaultValues: {
      title: collection.title,
      description: collection.description ?? "",
      question: collection.question ?? "",
      mode: collection.mode,
    },
  });

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

  const handleClickEdit = async () => {
    if (!id) {
      return;
    }

    const { title, description, mode, question } = getValues();

    try {
      setIsLoading(true);
      await editCollection(id, { title, description, mode, question });
      setCollection((val) =>
        val ? { ...val, title, description, mode, question } : undefined
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
      <Button onClick={handleClickEdit} loading={isLoading} disabled={!isValid}>
        Edit
      </Button>
      <Button onClick={openDeleteModal} color="red">
        Delete
      </Button>
    </Stack>
  );
};
