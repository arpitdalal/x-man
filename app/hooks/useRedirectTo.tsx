import { useSearchParams } from "@remix-run/react";
import { useMemo } from "react";

export default function useRedirectTo() {
  const [searchParams] = useSearchParams();

  const redirectTo = useMemo(
    () => searchParams.get("redirectTo") ?? "/app",
    [searchParams]
  );

  return redirectTo;
}
