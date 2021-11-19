// Reactive Local Storage
import { useState, useCallback, useEffect } from "react";

const setupReactiveStorage = () => {
  const frame = document.createElement("iframe");
  frame.frameBorder = "0";
  frame.scrolling = "no";
  frame.width = "1";
  frame.height = "1";
  frame.setAttribute(
    "style",
    "display:block;top:-9999px;left:-9999px;position:absolute;"
  );

  frame.src = "javascript:";

  return frame;
};

type Listener = (event: StorageEvent) => void;

const initReactiveStorage = () => {
  const hostFrame = setupReactiveStorage();

  document.body.appendChild(hostFrame);

  const hostWindow = hostFrame?.contentWindow!;

  const listeners: Listener[] = [];

  const handler = (event: StorageEvent) =>
    listeners.forEach((listener) => listener(event));

  hostWindow.addEventListener("storage", handler, false);

  return {
    addEventListener: (listener: Listener) => {
      listeners.push(listener);

      const removeEventListener = () => {
        const index = listeners.findIndex((fn) => fn === listener);

        listeners.splice(index, 1);
      };

      return removeEventListener;
    },
    close: () => hostWindow.removeEventListener("storage", handler, false)
  };
};

const storage = initReactiveStorage();

export const useReactivePersistentState = <Value extends any>(
  key: string,
  init: Value | (() => Value),
  serialize: (value: Value) => string,
  deserialize: (str: string | null) => Value
) => {
  const [state, updateState] = useState(
    init instanceof Function ? init() : init
  );

  useEffect(() => {
    const handler = ({ key: updatedKey, newValue }: StorageEvent) => {
      if (updatedKey !== key) return;

      updateState(deserialize(newValue));
    };

    const value = window.localStorage.getItem(key);

    updateState(deserialize(value));

    const removeEventListener = storage.addEventListener(handler);

    return removeEventListener;
  }, [key]);

  const setState = useCallback(
    (next: Value) => {
      return window.localStorage.setItem(key, serialize(next));
    },
    [key]
  );

  return [state, setState] as const;
};
