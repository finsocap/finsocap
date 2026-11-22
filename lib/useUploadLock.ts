import { useRef, useCallback, useState } from "react";

/**
 * Custom React hook for guaranteed Synchronous In-Flight Upload Locking & Double-Click Prevention.
 *
 * Prevents multiple rapid clicks from triggering duplicate upload API calls, even
 * before React's next render cycle runs.
 *
 * - Uses a synchronous `useRef` lock for immediate, synchronous blocking of rapid consecutive clicks.
 * - Manages an active loading `useState` for visual spinner and button disabling.
 * - Safely handles errors and releases the lock in `finally`, allowing legitimate retries.
 * - Keeps existing APIs, payloads, endpoints, and response handling 100% untouched.
 */
export function useUploadLock() {
  const [isUploading, setIsUploading] = useState(false);
  const isLockedRef = useRef(false);

  const executeWithLock = useCallback(async <T>(uploadFn: () => Promise<T>): Promise<T | null> => {
    // 1. Synchronous in-flight guard: block subsequent clicks in the same event frame
    if (isLockedRef.current) {
      return null;
    }
    isLockedRef.current = true;
    setIsUploading(true);

    try {
      const result = await uploadFn();
      return result;
    } finally {
      // 2. Release lock safely so user can retry upon failure or upload another document
      isLockedRef.current = false;
      setIsUploading(false);
    }
  }, []);

  return {
    isUploading,
    executeWithLock,
    isLocked: isLockedRef.current,
  };
}

/**
 * Keyed variant for lists or multi-document inputs (e.g., DynamicApplicationForm, DocumentRequestsModal)
 * where each document field needs independent locking without blocking other fields.
 */
export function useKeyedUploadLock() {
  const [uploadingKeys, setUploadingKeys] = useState<Record<string, boolean>>({});
  const locksMapRef = useRef<Record<string, boolean>>({});

  const executeKeyedWithLock = useCallback(
    async <T>(key: string, uploadFn: () => Promise<T>): Promise<T | null> => {
      if (locksMapRef.current[key]) {
        return null;
      }
      locksMapRef.current[key] = true;
      setUploadingKeys((prev) => ({ ...prev, [key]: true }));

      try {
        const result = await uploadFn();
        return result;
      } finally {
        locksMapRef.current[key] = false;
        setUploadingKeys((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    []
  );

  const isKeyUploading = useCallback((key: string) => {
    return !!uploadingKeys[key];
  }, [uploadingKeys]);

  return {
    uploadingKeys,
    executeKeyedWithLock,
    isKeyUploading,
  };
}

