import { Habit } from "./components/Habit"

function App() {
  return (
    <div className="App">
      <Habit completed={5} />
      <Habit completed={3} />
    </div>
  )
}

export default App
