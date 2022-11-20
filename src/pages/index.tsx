import { type NextPage } from "next";
import Head from "next/head";
import { Button, Group } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Login from "../components/Login";
import AzureForm from "../components/AzureForm";

const Home: NextPage = () => {
  const [localStorage, setLocalStorage] = useLocalStorage({
    key: "az-pbi-token",
    defaultValue: {
      token: "",
    },
  });

  return (
    <>
      <Head>
        <title>git-namer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <Button
          variant={"subtle"}
          onClick={() => {
            setLocalStorage({
              token: "",
            });
          }}
        >
          Logout
        </Button>

        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Group>
            {localStorage.token === "" && <Login />}

            {localStorage.token !== "" && (
              <AzureForm token={localStorage.token} />
            )}
          </Group>
        </div>
      </main>
    </>
  );
};

export default Home;
