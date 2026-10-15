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

const errorMessage = (err, fallback) => err.response?.data?.error || err.response?.data?.message || fallback;

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

  const upload = useCallback(async (file, customNotes = "", extra = {}) => {
    if (!file) return;
    const run = ++photoRun.current;
    setState({ ...INITIAL, status: "generating", localPhoto: URL.createObjectURL(file) });
    try {
      const form = new FormData();
      form.append("photo", await shrinkPhoto(file));
      const noteToSend = (typeof customNotes === "string" && customNotes.trim())
        ? customNotes.trim()
        : noteRef.current.trim();
      if (noteToSend) {
        form.append("customNotes", noteToSend);
        form.append("prompt", noteToSend);
      }
      if (extra?.engravingText) {
        form.append("engravingText", String(extra.engravingText).trim());
      }
      if (extra?.artisanNotes) {
        form.append("artisanNotes", String(extra.artisanNotes).trim());
      }
      const { data } = await api.post("/chibi/generate", form);
      if (run !== photoRun.current) return;
      const previewUrl = data.cuteImageUrl || data.imageUrl;
      setState((s) => ({
        ...s,
        status: previewUrl ? "ready" : "unavailable",
        originalUrl: data.photoUrl || s.originalUrl,
        attempts: previewUrl ? [previewUrl] : [],
        selected: 0,
        attemptsLeft: 3,
        error: previewUrl ? "" : (data.error || data.message || "3D preview could not be generated"),
      }));
    } catch (err) {
      if (run !== photoRun.current) return;
      console.warn("Chibi upload error:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Generation request failed";
      setState((s) => ({
        ...s,
        status: "error",
        error: errMsg,
      }));
    }
  }, []);

  const regenerate = useCallback(async (customNotes = "", extra = {}) => {
    if (!state.originalUrl) return;
    const run = photoRun.current;
    setState((s) => ({ ...s, regenerating: true, error: "" }));
    try {
      const noteToSend = (typeof customNotes === "string" && customNotes.trim())
        ? customNotes.trim()
        : noteRef.current.trim();
      const payload = {
        photoUrl: state.originalUrl,
        customNotes: noteToSend,
        prompt: noteToSend,
      };
      if (extra?.engravingText) {
        payload.engravingText = String(extra.engravingText).trim();
      }
      if (extra?.artisanNotes) {
        payload.artisanNotes = String(extra.artisanNotes).trim();
      }
      const { data } = await api.post("/chibi/generate", payload);
      if (run !== photoRun.current) return;
      const newUrl = data.cuteImageUrl || data.imageUrl;
      if (newUrl) {
        setState((s) => {
          const attempts = [...s.attempts, newUrl];
          const attemptsLeft = Math.max(0, (s.attemptsLeft ?? 3) - 1);
          return {
            ...s,
            status: "ready",
            regenerating: false,
            attempts,
            selected: attempts.length - 1,
            attemptsLeft,
            error: "",
          };
        });
      } else {
        setState((s) => ({
          ...s,
          regenerating: false,
          error: "",
        }));
      }
    } catch (err) {
      if (run !== photoRun.current) return;
      setState((s) => ({
        ...s,
        regenerating: false,
        error: "",
      }));
    }
  }, [state.originalUrl]);

  const select = useCallback((index) => setState((s) => ({ ...s, selected: index })), []);
  const reset = useCallback(() => {
    photoRun.current += 1;
    setState(INITIAL);
    setNote("");
  }, [setNote]);

  const approvedPreview = state.attempts[state.selected] || null;

  /**
   * Fields for the cart item: the approved cute 3D design and the hosted original
   * photo. The admin downloads this exact image to create the 3D model.
   */
  const cartFields = () => {
    if (state.status === "ready" && approvedPreview) {
      return {
        image: approvedPreview,
        customization: {
          photoUrl: state.originalUrl || state.localPhoto,
          cuteImageUrl: approvedPreview,
          note: noteRef.current.trim(),
        },
      };
    }
    const fallbackPhoto = state.originalUrl || state.localPhoto;
    if (fallbackPhoto) {
      return {
        image: fallbackPhoto,
        customization: {
          photoUrl: fallbackPhoto,
          cuteImageUrl: null,
          note: noteRef.current.trim(),
        },
      };
    }
    return null;
  };

  return {
    ...state,
    approvedPreview,
    busy: state.status === "generating" || state.regenerating,
    canOrder: Boolean((state.status === "ready" && approvedPreview) || state.originalUrl || state.localPhoto),
    upload,
    regenerate,
    select,
    reset,
    cartFields,
    note,
    setNote,
  };
}
