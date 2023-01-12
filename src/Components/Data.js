import { createContext, useState } from "react";
import { db } from "../Firebase";
export const StoreContext = createContext(null);

// eslint-disable-next-line import/no-anonymous-default-export
export default ({ children }) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const store = {
    searchFocusStore: [searchFocus, setSearchFocus],
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
