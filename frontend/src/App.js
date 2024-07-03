import "./App.css";
import Route from "./routes/Routes";
import { UserContext } from "./contexts/UserContext";
import { useState } from "react";
function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{user, setUser}}>
      <Route />
    </UserContext.Provider>
  );
}

export default App;
