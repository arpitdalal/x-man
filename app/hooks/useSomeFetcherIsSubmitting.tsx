import { useFetchers } from "@remix-run/react";

export const useSomeFetcherIsSubmitting = () => {
  const all_fetchers = useFetchers();

  const filtered_fetchers = all_fetchers.filter(
    (fetcher) => fetcher.state === "submitting"
  );

  return filtered_fetchers.length > 0;
};
