import { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (title, message, type = "success") => {
    setAlert({
      title,
      message,
      type,
    });

    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const closeAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {alert && (
        <div className="custom-alert">
          <div className={`alert-card ${alert.type}`}>

            <button
              className="alert-close"
              onClick={closeAlert}
            >
              ×
            </button>

            <div className="alert-icon">
              ✓
            </div>

            <h2>{alert.title}</h2>

            <p>{alert.message}</p>

            <button
              className="alert-button"
              onClick={closeAlert}
            >
              OK
            </button>

          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  return useContext(AlertContext);
};
