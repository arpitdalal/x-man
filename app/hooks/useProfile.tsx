import { useRouteLoaderData } from "@remix-run/react";
import type { AppLoaderData } from "~/routes/app";

export default function useProfile() {
  const loaderData = useRouteLoaderData("routes/app") as AppLoaderData;
  if (!loaderData?.profile) {
    throw new Error("Profile not found");
  }

  return loaderData.profile;
}
