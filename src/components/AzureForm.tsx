import { type NextPage } from "next";
import { IconCheck, IconCopy } from "@tabler/icons";

import { trpc } from "../utils/trpc";
import { useForm } from "@mantine/form";
import {
  ActionIcon,
  Button,
  CopyButton,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useState } from "react";
import { RouterOutput } from "../server/trpc/router/_app";
import { showNotification } from "@mantine/notifications";

const AzureForm: NextPage<{ token: string }> = (props) => {
  const fetchPBI = trpc.azure.getPBI.useMutation();
  const form = useForm({
    initialValues: {
      pbi: "",
    },
  });
  const [pbiData, setPbiData] = useState<
    RouterOutput["azure"]["getPBI"]["payload"]
  >({
    title: "",
    id: "",
    type: "",
  });
  const [selectedFeature, setSelectedFeature] = useState<string | null>(
    "feature"
  );
  const [pbiTitle, setPbiTitle] = useState<string>("");

  const branchName = `${selectedFeature}/${pbiData?.id}-${pbiTitle
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/ /g, "-")
    .replace(/--/g, "")}`;

  return (
    <Paper shadow={"xs"} p={"md"}>
      <Stack>
        <form
          onSubmit={form.onSubmit(async (values) => {
            await fetchPBI
              .mutateAsync({
                pbi: values.pbi,
                token: props.token,
              })
              .then((res) => {
                if (res && res.ok && res.payload) {
                  setPbiData(res.payload);
                  setPbiTitle(res.payload.title);
                  switch (res.payload.type) {
                    case "Feature" || "feature":
                      setSelectedFeature("feature");
                      break;
                    case "Bug" || "bug":
                      setSelectedFeature("bug");
                      break;
                    default:
                      setSelectedFeature("feature");
                  }
                } else {
                  console.error(res?.error);
                  showNotification({
                    title: "Error fetching the PBI",
                    message: res.error,
                    color: "red",
                  });
                }
              })
              .catch((error) => {
                console.error(error);
              });
          })}
        >
          <TextInput
            withAsterisk
            label="Product Backlog ID"
            placeholder="2345"
            {...form.getInputProps("pbi")}
            required
          />
          <Group position="center" mt="md">
            <Button type="submit" variant={"subtle"}>
              Submit
            </Button>
          </Group>
        </form>

        {pbiData?.title !== "" && (
          <>
            <h2 className="text-center text-2xl font-bold">
              PBI: {pbiData?.id}
            </h2>
            <TextInput
              label="Name"
              value={pbiTitle}
              onChange={(e) => setPbiTitle(e.target.value)}
            />
            <Select
              label="Type"
              value={selectedFeature}
              onChange={setSelectedFeature}
              data={[
                { label: "Feature", value: "feature" },
                { label: "Bug", value: "bug" },
              ]}
            />
            <Divider />
            <Group>
              <CopyButton value={branchName} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={copied ? "Copied" : "Copy"}
                    withArrow
                    position="top"
                  >
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconCopy size={16} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
              <Text>{branchName}</Text>
            </Group>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default AzureForm;
