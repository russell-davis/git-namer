import { type NextPage } from "next";

import { trpc } from "../utils/trpc";
import { useForm } from "@mantine/form";
import { Button, Checkbox, Group, Paper, TextInput } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { Buffer } from "buffer";

const Login: NextPage = () => {
  const verifyLogin = trpc.auth.verifyLogin.useMutation();
  const [localStorage, setLocalStorage] = useLocalStorage({
    key: "az-pbi-token",
    defaultValue: {
      token: "",
    },
  });
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      stayLoggedIn: true,
    },
  });

  return (
    <Paper shadow="xs" p="md">
      <form
        onSubmit={form.onSubmit(async (values) => {
          const token = Buffer.from(
            `${values.username}:${values.password}`
          ).toString("base64");
          verifyLogin
            .mutateAsync({ token })
            .then((res) => {
              if (res?.ok) {
                setLocalStorage({
                  token: token,
                });
              } else {
                console.error(res?.error);
                showNotification({
                  title: "Error fetching the PBI",
                  message: res?.error,
                  color: "red",
                });
              }
            })
            .catch((err) => {
              console.error(err);
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

        <Checkbox
          mt="md"
          label="Stay logged in"
          {...form.getInputProps("stayLoggedIn", { type: "checkbox" })}
        />

        <Group position="center" mt="md">
          <Button type="submit" variant={"subtle"}>
            Login
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default Login;
