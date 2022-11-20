import { publicProcedure, router } from "../trpc";
import { exampleRouter } from "./example";
import { z } from "zod";
import axios from "axios";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
  example: exampleRouter,
  azure: router({
    getPBI: publicProcedure
      .input(
        z.object({
          pbi: z.string(),
          token: z.string(),
        })
      )
      .mutation((input) => {
        const config = {
          method: "get",
          url: `https://dev.azure.com/${process.env.AZ_ORG}/${process.env.AZ_PROJ}/_apis/wit/workitems/${input.input.pbi}?api-version=7.0`,
          headers: {
            Authorization: `Basic ${input.input.token}`,
          },
        };
        const pbiData = axios(config)
          .then(function (response) {
            const data = response.data;
            const fields = data.fields;
            const payload = {
              id: data.id,
              title: fields["System.Title"],
              type: fields["System.WorkItemType"],
            };
            return {
              ok: true,
              payload,
              error: null,
            };
          })
          .catch(function (error) {
            console.log(error.response.data.message);
            return {
              ok: false,
              payload: null,
              error: error.response.data.message,
            };
          });
        return pbiData;
      }),
  }),
  auth: router({
    verifyLogin: publicProcedure
      .input(
        z.object({
          token: z.string(),
        })
      )
      .mutation((input) => {
        const config = {
          method: "get",
          url: `https://dev.azure.com/interworks/Internal/_apis/git/repositories/MOAS/pullrequests?api-version=7`,
          headers: {
            Authorization: `Basic ${input.input.token}`,
          },
        };
        const pbiData = axios(config)
          .then(function (response) {
            if (response.status === 200) {
              return {
                ok: true,
                payload: {
                  count: response.data.count,
                },
                error: null,
              };
            } else if (response.status === 203) {
              return {
                ok: false,
                payload: null,
                error: "Invalid credentials",
              };
            }
          })
          .catch(function (error) {
            console.log(error.response.data.message);
            return {
              ok: false,
              payload: null,
              error: error.response.data.message,
            };
          });
        return pbiData;
      }),
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
