import logo from "./logo.svg";
import "./App.css";
import { useReactivePersistentState } from "./storage";

const useLocalStorageCounter = () => {
  return useReactivePersistentState(
    "counter",
    () => Number(window.localStorage.getItem("counter")),
    JSON.stringify,
    Number
  );
};

const View = () => {
  const [count] = useLocalStorageCounter();

  return <p>The count is: {count}</p>;
};

function App() {
  const [count, setCount] = useLocalStorageCounter();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <View />

        <p>
          <button type="button" onClick={() => setCount(count + 1)}>
            Inc +1
          </button>
        </p>
        <p>
          <button type="button" onClick={() => setCount(count - 1)}>
            Dec -1
          </button>
        </p>
        <p>
          <button type="button" onClick={() => setCount(0)}>
            Reset
          </button>
        </p>
      </header>
    </div>
  );
}

export default App;
