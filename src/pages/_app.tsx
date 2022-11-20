import { type AppType } from "next/app";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import {MantineProvider} from "@mantine/core";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <MantineProvider>
    <Component {...pageProps} />
  </MantineProvider>;
};

export default trpc.withTRPC(MyApp);
