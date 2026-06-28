import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUploadBatch } from "@/hooks/use-upload-batch";

function file(name: string) {
  return new File(["content"], name, {
    type: "image/jpeg",
    lastModified: 1,
  });
}

describe("useUploadBatch", () => {
  it("keeps successful uploads, reports per-file failures and retries only failed files", async () => {
    const attempts = new Map<string, number>();
    const upload = vi.fn(async ({ item, setPreparing, setUploading }) => {
      setPreparing();
      setUploading();

      const count = attempts.get(item.file.name) ?? 0;
      attempts.set(item.file.name, count + 1);

      if (item.file.name === "broken.jpg" && count === 0) {
        throw new Error("Unsupported file");
      }
    });

    const { result } = renderHook(() =>
      useUploadBatch({
        concurrency: 2,
        upload,
      }),
    );

    await act(async () => {
      await result.current.run({
        files: [file("ok.jpg"), file("broken.jpg")],
      });
    });

    await waitFor(() => {
      expect(result.current.summary.saved).toBe(1);
      expect(result.current.summary.failed).toBe(1);
    });
    expect(result.current.items.map((item) => item.status)).toEqual([
      "saved",
      "failed",
    ]);
    expect(result.current.items[1]?.error).toBe("Unsupported file");

    await act(async () => {
      await result.current.retryFailed();
    });

    await waitFor(() => {
      expect(result.current.summary.saved).toBe(2);
      expect(result.current.summary.failed).toBe(0);
    });
    expect(upload).toHaveBeenCalledTimes(3);
    expect(attempts.get("ok.jpg")).toBe(1);
    expect(attempts.get("broken.jpg")).toBe(2);
  });

  it("bounds concurrent uploads", async () => {
    let active = 0;
    let maxActive = 0;
    const upload = vi.fn(async ({ setUploading }) => {
      setUploading();
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => window.setTimeout(resolve, 5));
      active -= 1;
    });

    const { result } = renderHook(() =>
      useUploadBatch({
        concurrency: 2,
        upload,
      }),
    );

    await act(async () => {
      await result.current.run({
        files: [file("one.jpg"), file("two.jpg"), file("three.jpg")],
      });
    });

    expect(upload).toHaveBeenCalledTimes(3);
    expect(maxActive).toBeLessThanOrEqual(2);
  });
});
