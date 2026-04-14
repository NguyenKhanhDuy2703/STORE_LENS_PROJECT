import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import AppRouter from "./routes";

function AppContent() {
  return <AppRouter />;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>  
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
