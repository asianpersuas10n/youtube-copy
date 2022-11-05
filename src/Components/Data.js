import { createContext } from "react";
import { db } from "../Firebase";
export const StoreContext = createContext(null);

// eslint-disable-next-line import/no-anonymous-default-export
export default ({ children }) => {
  const store = {};

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
