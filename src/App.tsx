import React from "react";
import { BrowserRouter } from "react-router-dom";
import ExcelTraining from "./components/ExcelTraining";
import { UserProvider } from "./contexts/UserContext";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || ""}>
      <UserProvider>
        <div className="App">
          <ExcelTraining />
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
