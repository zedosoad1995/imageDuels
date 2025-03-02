import { Group, Radio, Stack, Text } from "@mantine/core";
import classes from "./Mode.module.css";
import { CollectionModeType } from "../../../Types/collection";

const modesData: {
  value: CollectionModeType;
  name: string;
  description: string;
}[] = [
  {
    value: "PUBLIC",
    name: "Public",
    description: "Anyone can see and find this collection.",
  },
  {
    value: "PRIVATE",
    name: "Private",
    description: "Only accessible via a shared link; not searchable.",
  },
  {
    value: "PERSONAL",
    name: "Personal",
    description:
      "Only you can ever access this collection, with no way to share it.",
  },
];

interface Props {
  value: CollectionModeType;
  onChange?: (value: string) => void;
}

export const Mode = ({ value, onChange }: Props) => {
  return (
    <Radio.Group value={value} onChange={onChange} label="Collection Mode">
      <Stack pt="md" gap="xs">
        {modesData.map((item) => (
          <Radio.Card
            radius="md"
            value={item.value}
            key={item.value}
            className={classes.root}
          >
            <Group wrap="nowrap" align="flex-start">
              <Radio.Indicator />
              <div>
                <Text className={classes.label}>{item.name}</Text>
                <Text className={classes.description}>{item.description}</Text>
              </div>
            </Group>
          </Radio.Card>
        ))}
      </Stack>
    </Radio.Group>
  );
};
