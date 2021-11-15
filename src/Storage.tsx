// Reactive Local Storage
import {
  useState,
  ReactNode,
  useContext,
  createContext,
  useCallback,
  Fragment,
  useEffect
} from "react";

const StorageHostContext = createContext<Window | null | undefined>(null);

export const ReactiveStorageProvider = ({
  className,
  children
}: {
  className?: string;
  children?: ReactNode;
}) => {
  const [ref, setRef] = useState<HTMLIFrameElement | null>(null);

  const hostWindow = ref?.contentWindow;

  return (
    <Fragment>
      <iframe
        ref={setRef}
        className={className}
        frameBorder="0"
        scrolling="no"
        width="1"
        height="1"
        style={{ display: "block", top: 0, left: 0, position: "absolute" }}
      />

      <StorageHostContext.Provider value={hostWindow}>
        {children}
      </StorageHostContext.Provider>
    </Fragment>
  );
};

type StorageHandler<Result> = (event: StorageEvent) => Result;

export const useReactivePersistentState = <Value extends any>(
  key: string,
  init: Value | (() => Value),
  serialize: (value: Value) => string,
  deserialize: (str: string | null) => Value
) => {
  const hostWindow = useContext(StorageHostContext);

  const [state, updateState] = useState(
    init instanceof Function ? init() : init
  );

  useEffect(() => {
    if (!hostWindow) return;

    const handler = ({ key: updatedKey, newValue }: StorageEvent) => {
      console.log("handler");
      if (updatedKey !== key) return;

      updateState(deserialize(newValue));
    };

    const value = window.localStorage.getItem(key);

    updateState(deserialize(value));

    hostWindow.addEventListener("storage", handler);

    return () => hostWindow.removeEventListener("storage", handler);
  }, [key, hostWindow]);

  const setState = useCallback(
    (next: Value | ((prev: Value) => Value)) => {
      if (typeof window === "undefined") return;

      if (next instanceof Function) {
        const current = deserialize(window.localStorage.getItem(key));
        return window.localStorage.setItem(key, serialize(next(current)));
      }
      return window.localStorage.setItem(key, serialize(next));
    },
    [key]
  );

  return [state, setState] as const;
};
