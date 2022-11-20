import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { IconCopy, IconCheck } from "@tabler/icons";

import { RouterInputs, trpc } from "../utils/trpc";
import { useForm } from "@mantine/form";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  CopyButton,
  Group,
  Paper,
  TextInput,
  Tooltip,
  Text,
  Select,
  Stack,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { appRouter, RouterOutput } from "../server/trpc/router/_app";

const Home: NextPage = () => {
  const fetchPBI = trpc.azure.getPBI.useMutation();
  const [localStorage, setLocalStorage, removeLocalStorage] = useLocalStorage({
    key: "az-pbi-token",
    defaultValue: {
      username: "",
      password: "",
    },
  });
  const form = useForm({
    initialValues: {
      pbi: "",
      username: localStorage.username,
      password: localStorage.password,
      stayLoggedIn: true,
    },
  });
  useEffect(() => {
    if (localStorage.username !== "" && localStorage.password !== "") {
      form.setFieldValue("username", localStorage.username);
      form.setFieldValue("password", localStorage.password);
    }
  }, [localStorage.username, localStorage.password]);
  const [pbiData, setPbiData] = useState<RouterOutput["azure"]["getPBI"]>({
    title: "",
    id: "",
  });
  const [selectedFeature, setSelectedFeature] = useState<string | null>(
    "feature"
  );

  const toggleStayLoggedIn = (values: {
    pbi?: string;
    username: any;
    password: any;
    stayLoggedIn: any;
  }) => {
    if (values.stayLoggedIn) {
      setLocalStorage({
        username: values.username,
        password: values.password,
      });
    }
  };

  const branchName = `${selectedFeature}/${pbiData?.id}-${pbiData?.title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/--/g, "")}`;

  return (
    <>
      <Head>
        <title>git-namer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Group>
            <Paper shadow="xs" p="md">
              <form
                onSubmit={form.onSubmit(async (values) => {
                  await fetchPBI
                    .mutateAsync(values)
                    .then((res) => {
                      toggleStayLoggedIn(values);
                      if (res) {
                        setPbiData(res);
                      }
                    })
                    .catch((e) => {
                      console.error(e);
                    });
                })}
              >
                <TextInput
                  withAsterisk
                  label="Username"
                  {...form.getInputProps("username")}
                />

                <TextInput
                  withAsterisk
                  label="Password"
                  type={"password"}
                  {...form.getInputProps("password")}
                />

                <TextInput
                  withAsterisk
                  label="Product Backlog ID"
                  placeholder="2345"
                  {...form.getInputProps("pbi")}
                  required
                />

                <Checkbox
                  mt="md"
                  label="Stay logged in"
                  {...form.getInputProps("stayLoggedIn", { type: "checkbox" })}
                />

                <Group position="right" mt="md">
                  <Button type="submit" variant={"subtle"}>
                    Submit
                  </Button>
                </Group>
              </form>
            </Paper>

            {pbiData?.title !== "" && (
              <Paper shadow={"xs"} p={"md"}>
                <Stack>
                  <h2 className="text-center text-2xl font-bold">Result</h2>
                  <Text size={"lg"}>
                    {pbiData?.id}::{pbiData?.title}
                  </Text>
                  <Select
                    value={selectedFeature}
                    onChange={setSelectedFeature}
                    data={[
                      { label: "Feature", value: "feature" },
                      { label: "Bug", value: "bug" },
                    ]}
                  />

                  <Group>
                    <Text>{branchName}</Text>
                    <CopyButton value={branchName} timeout={2000}>
                      {({ copied, copy }) => (
                        <Tooltip
                          label={copied ? "Copied" : "Copy"}
                          withArrow
                          position="right"
                        >
                          <ActionIcon
                            color={copied ? "teal" : "gray"}
                            onClick={copy}
                          >
                            {copied ? (
                              <IconCheck size={16} />
                            ) : (
                              <IconCopy size={16} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                </Stack>
              </Paper>
            )}
          </Group>
        </div>
      </main>
    </>
  );
};

export default Home;
