// Redux Imports
import { useSelector } from "react-redux";

// Firebase Imports
import {
  ReduxFirestoreQuerySetting,
  useFirestoreConnect,
} from "react-redux-firebase";
import { getUser } from "../Redux/firebase";

const useUniversalConnect = (): void => {
  const user = useSelector(getUser);
  const connects: ReduxFirestoreQuerySetting[] = [];

  if (!user.isEmpty) {
    connects.push({
      collection: "users",
      doc: user.uid ?? "",
      subcollections: [{ collection: "defaultProfiles" }],
      storeAs: "existingDefaultProfiles",
    });
  }

  useFirestoreConnect(connects);
};

export default useUniversalConnect;
