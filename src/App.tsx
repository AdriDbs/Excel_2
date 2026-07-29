import React from "react";
import { HashRouter } from "react-router-dom";
import ExcelTraining from "./components/ExcelTraining";
import { UserProvider } from "./contexts/UserContext";
import { ExcelLanguageProvider } from "./contexts/ExcelLanguageContext";

function App() {
  return (
    <HashRouter>
      <UserProvider>
        <ExcelLanguageProvider>
          <div className="App">
            <ExcelTraining />
          </div>
        </ExcelLanguageProvider>
      </UserProvider>
    </HashRouter>
  );
}

export default App;
