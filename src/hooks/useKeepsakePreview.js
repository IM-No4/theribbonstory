import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";

const INITIAL = {
  status: "idle", // idle | generating | ready | unavailable | error
  regenerating: false,
  sessionId: null,
  originalUrl: null,
  localPhoto: null,
  attempts: [],
  selected: 0,
  attemptsLeft: 0,
  error: "",
};

const MAX_SIDE = 2048;
export const NOTE_MAX = 200;

/**
 * Phone photos are often larger than the 5 MB upload limit: scale them down
 * in the browser first (2048px is plenty for the 3D design). Falls back to
 * the original file if the browser can't decode it.
 */
export const shrinkPhoto = async (file) => {
  if (typeof createImageBitmap !== "function" || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
};

const errorMessage = (err, fallback) => err.response?.data?.message || fallback;

/**
 * Customer photo -> cute 3D design preview. The design the customer picks is
 * the exact image the studio turns into the 3D model and prints, so it is
 * sent with the cart item and verified by the server at checkout.
 */
export function useKeepsakePreview() {
  const [state, setState] = useState(INITIAL);
  // Ignore a slow response for a photo the customer has since replaced
  const photoRun = useRef(0);
  // Optional design note ("add a little crown"), sent with each new design
  const [note, setNoteState] = useState("");
  const noteRef = useRef("");
  const setNote = useCallback((value) => {
    const next = String(value || "").slice(0, NOTE_MAX);
    noteRef.current = next;
    setNoteState(next);
  }, []);

  // Free the local photo preview when it is replaced or the page closes
  useEffect(() => {
    const url = state.localPhoto;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [state.localPhoto]);

  const upload = useCallback(async (file) => {
    if (!file) return;
    const run = ++photoRun.current;
    setState({ ...INITIAL, status: "generating", localPhoto: URL.createObjectURL(file) });
    try {
      const form = new FormData();
      form.append("photo", await shrinkPhoto(file));
      if (noteRef.current.trim()) form.append("customNotes", noteRef.current.trim());
      const { data } = await api.post("/3d-agent/preview", form);
      if (run !== photoRun.current) return;
      setState((s) => ({
        ...s,
        status: data.previewAvailable ? "ready" : "unavailable",
        sessionId: data.sessionId,
        originalUrl: data.originalUrl,
        attempts: data.previewUrl ? [data.previewUrl] : [],
        selected: 0,
        attemptsLeft: data.attemptsLeft,
      }));
    } catch (err) {
      if (run !== photoRun.current) return;
      setState((s) => ({ ...s, status: "error", error: errorMessage(err, "We couldn't read that photo. Please try another one.") }));
    }
  }, []);

  const { sessionId } = state;
  const regenerate = useCallback(async () => {
    if (!sessionId) return;
    const run = photoRun.current;
    setState((s) => ({ ...s, regenerating: true, error: "" }));
    try {
      const { data } = await api.post(`/3d-agent/preview/${sessionId}/regenerate`, { customNotes: noteRef.current.trim() });
      if (run !== photoRun.current) return;
      setState((s) => {
        const attempts = data.previewUrl ? [...s.attempts, data.previewUrl] : s.attempts;
        return { ...s, regenerating: false, attempts, selected: attempts.length - 1, attemptsLeft: data.attemptsLeft };
      });
    } catch (err) {
      if (run !== photoRun.current) return;
      setState((s) => ({
        ...s,
        regenerating: false,
        attemptsLeft: err.response?.status === 429 ? 0 : s.attemptsLeft,
        error: errorMessage(err, "We couldn't create a new design just now. Your current design is kept."),
      }));
    }
  }, [sessionId]);

  const select = useCallback((index) => setState((s) => ({ ...s, selected: index })), []);
  const reset = useCallback(() => {
    photoRun.current += 1;
    setState(INITIAL);
    setNote("");
  }, [setNote]);

  const approvedPreview = state.attempts[state.selected] || null;

  /**
   * Fields for the cart item: the approved design and the hosted original
   * photo. When no design could be made, the studio sculpts from the photo.
   */
  const cartFields = () => {
    if (state.status === "ready" && approvedPreview) {
      return {
        image: approvedPreview,
        customization: { photoUrl: state.originalUrl, reference3D: { sessionId: state.sessionId, approvedPreview } },
      };
    }
    if (state.status === "unavailable" && state.originalUrl) {
      return { image: state.originalUrl, customization: { photoUrl: state.originalUrl } };
    }
    return null;
  };

  return {
    ...state,
    approvedPreview,
    busy: state.status === "generating" || state.regenerating,
    canOrder: (state.status === "ready" && Boolean(approvedPreview)) || (state.status === "unavailable" && Boolean(state.originalUrl)),
    upload,
    regenerate,
    select,
    reset,
    cartFields,
    note,
    setNote,
  };
}
