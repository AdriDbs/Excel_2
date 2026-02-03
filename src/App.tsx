import React from "react";
import ExcelTraining from "./components/ExcelTraining";
import { UserProvider } from "./contexts/UserContext";

function App() {
  return (
    <UserProvider>
      <div className="App">
        <ExcelTraining />
      </div>
    </UserProvider>
  );
}

export default App;
