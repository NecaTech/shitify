"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export type UploadBatchItemStatus =
  | "waiting"
  | "preparing"
  | "uploading"
  | "saved"
  | "failed";

export type UploadBatchItem = {
  id: string;
  file: File;
  name: string;
  status: UploadBatchItemStatus;
  error: string | null;
};

export type UploadBatchSummary = {
  total: number;
  waiting: number;
  preparing: number;
  uploading: number;
  saved: number;
  failed: number;
  active: number;
  done: number;
  isRunning: boolean;
  canRetryFailed: boolean;
};

type UploadBatchRunner = {
  item: UploadBatchItem;
  setPreparing: () => void;
  setUploading: () => void;
};

type RunOptions = {
  files?: File[];
  onlyFailed?: boolean;
};

type UseUploadBatchOptions = {
  concurrency?: number;
  getItemName?: (file: File) => string;
  upload: (runner: UploadBatchRunner) => Promise<void>;
  onComplete?: (summary: UploadBatchSummary) => void;
};

const runningStatuses = new Set<UploadBatchItemStatus>([
  "waiting",
  "preparing",
  "uploading",
]);

function createItem(file: File, getItemName: (file: File) => string) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    name: getItemName(file),
    status: "waiting" as const,
    error: null,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Upload interrupted. Check the connection, then retry.";
  }

  return error instanceof Error ? error.message : "Upload failed.";
}

function summarizeItems(items: UploadBatchItem[]): UploadBatchSummary {
  const summary = items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    {
      total: items.length,
      waiting: 0,
      preparing: 0,
      uploading: 0,
      saved: 0,
      failed: 0,
    },
  );
  const active = summary.waiting + summary.preparing + summary.uploading;

  return {
    ...summary,
    active,
    done: summary.saved + summary.failed,
    isRunning: active > 0,
    canRetryFailed: active === 0 && summary.failed > 0,
  };
}

export function useUploadBatch({
  concurrency = 2,
  getItemName = (file) => file.name,
  upload,
  onComplete,
}: UseUploadBatchOptions) {
  const [items, setItems] = useState<UploadBatchItem[]>([]);
  const itemsRef = useRef<UploadBatchItem[]>([]);
  const runIdRef = useRef(0);
  const normalizedConcurrency = Math.max(1, Math.floor(concurrency));

  const setItemsAndRef = useCallback(
    (
      updater:
        | UploadBatchItem[]
        | ((current: UploadBatchItem[]) => UploadBatchItem[]),
    ) => {
      const next =
        typeof updater === "function" ? updater(itemsRef.current) : updater;
      itemsRef.current = next;
      setItems(next);
    },
    [],
  );

  const setItemState = useCallback(
    (
      itemId: string,
      patch:
        | Partial<Pick<UploadBatchItem, "status" | "error">>
        | ((
            item: UploadBatchItem,
          ) => Partial<Pick<UploadBatchItem, "status" | "error">>),
    ) => {
      setItemsAndRef((current) =>
        current.map((item) => {
          if (item.id !== itemId) return item;
          const nextPatch = typeof patch === "function" ? patch(item) : patch;

          return { ...item, ...nextPatch };
        }),
      );
    },
    [setItemsAndRef],
  );

  const summary = useMemo(() => summarizeItems(items), [items]);

  const clear = useCallback(() => {
    runIdRef.current += 1;
    setItemsAndRef([]);
  }, [setItemsAndRef]);

  const run = useCallback(
    async ({ files, onlyFailed = false }: RunOptions = {}) => {
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;

      const nextItems = onlyFailed
        ? itemsRef.current.map((item) =>
            item.status === "failed"
              ? { ...item, status: "waiting" as const, error: null }
              : item,
          )
        : (files ?? []).map((file) => createItem(file, getItemName));

      const queue = nextItems.filter((item) => item.status === "waiting");
      setItemsAndRef(nextItems);

      if (queue.length === 0) {
        onComplete?.(summarizeItems(nextItems));
        return;
      }

      let cursor = 0;

      async function worker() {
        while (runIdRef.current === runId) {
          const item = queue[cursor];
          cursor += 1;

          if (!item) return;

          try {
            await upload({
              item,
              setPreparing: () =>
                setItemState(item.id, {
                  status: "preparing",
                  error: null,
                }),
              setUploading: () =>
                setItemState(item.id, {
                  status: "uploading",
                  error: null,
                }),
            });
            setItemState(item.id, { status: "saved", error: null });
          } catch (error) {
            setItemState(item.id, {
              status: "failed",
              error: getErrorMessage(error),
            });
          }
        }
      }

      await Promise.all(
        Array.from(
          { length: Math.min(normalizedConcurrency, queue.length) },
          () => worker(),
        ),
      );

      const completedItems = itemsRef.current.map((item) =>
        runningStatuses.has(item.status)
          ? { ...item, status: "failed" as const, error: "Upload interrupted." }
          : item,
      );
      setItemsAndRef(completedItems);
      onComplete?.(summarizeItems(completedItems));
    },
    [
      getItemName,
      normalizedConcurrency,
      onComplete,
      setItemState,
      setItemsAndRef,
      upload,
    ],
  );

  return {
    items,
    summary,
    run,
    retryFailed: () => run({ onlyFailed: true }),
    clear,
  };
}
