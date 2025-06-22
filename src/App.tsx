
import { BrowserRouter as Router } from "react-router-dom";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AppProviders>
      <Router>
        <AppRoutes />
      </Router>
    </AppProviders>
  );
}

export default App;
