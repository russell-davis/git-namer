import { publicProcedure, router } from "../trpc";
import { exampleRouter } from "./example";
import { z } from "zod";
import axios from "axios";
import { btoa } from "buffer";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
  example: exampleRouter,
  azure: router({
    getPBI: publicProcedure
      .input(
        z.object({
          pbi: z.string(),
          username: z.string(),
          password: z.string(),
        })
      )
      .mutation((input) => {
        const config = {
          method: "get",
          url: `https://dev.azure.com/interworks/Internal/_apis/wit/workitems/${input.input.pbi}?api-version=7.0`,
          headers: {
            Authorization: `Basic ${btoa(
              `${input.input.username}:${input.input.password}`
            )}`,
          },
        };
        const pbiData = axios(config)
          .then(function (response) {
            const data = response.data;
            const fields = data.fields;
            const payload = {
              id: data.id,
              title: fields["System.Title"],
            };
            console.debug(payload);
            return payload;
          })
          .catch(function (error) {
            console.log(error);
          });
        return pbiData;
      }),
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
