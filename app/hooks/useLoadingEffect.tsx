import { useCallback, useEffect, useState } from "react";
import debounce from "just-debounce-it";
import nProgress from "nprogress";
import { useGlobalPendingState } from "remix-utils";

export const useLoadingEffect = () => {
  const globalState = useGlobalPendingState();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedStart = useCallback(
    debounce(
      () => {
        nProgress.start();
      },
      50,
      true
    ),
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedDone = useCallback(
    debounce(
      () => {
        nProgress.done();
      },
      50,
      false
    ),
    []
  );

  const [globalIsLoading, setGlobalIsLoading] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (globalState !== "idle" && !globalIsLoading) {
      timeout = setTimeout(() => {
        if (!globalIsLoading) {
          setGlobalIsLoading(true);
        }
      }, 10);
    } else {
      setGlobalIsLoading(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [globalState, debouncedStart, debouncedDone, globalIsLoading]);

  useEffect(() => {
    if (globalIsLoading) {
      debouncedStart();
    } else {
      debouncedDone();
    }

    return () => {
      debouncedDone();
    };
  }, [globalIsLoading, debouncedStart, debouncedDone]);
};
