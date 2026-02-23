import React from "react";
import { HashRouter } from "react-router-dom";
import ExcelTraining from "./components/ExcelTraining";
import { UserProvider } from "./contexts/UserContext";

function App() {
  return (
    <HashRouter>
      <UserProvider>
        <div className="App">
          <ExcelTraining />
        </div>
      </UserProvider>
    </HashRouter>
  );
}

export default App;
