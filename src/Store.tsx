// React Imports
import React, { FC } from "react";
import { BadgeIcon } from "./Components/Badge";

// Redux Imports
import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
  ThunkAction,
  Action,
} from "@reduxjs/toolkit";
import { Provider, useDispatch } from "react-redux";

// Firebase Imports
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";
import "firebase/performance";
import "firebase/firestore";
import { firebaseConfig } from "./Utils/config";
import {
  getFirebase,
  actionTypes as rrfActionTypes,
  firebaseReducer,
  ReactReduxFirebaseProvider,
  FirebaseReducer,
  FirestoreReducer,
} from "react-redux-firebase";
import {
  getFirestore,
  constants as rfConstants,
  createFirestoreInstance,
  firestoreReducer,
} from "redux-firestore";

// Redux Persist Imports
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { PersistGate } from "redux-persist/lib/integration/react";
import storage from "redux-persist/lib/storage";

// Reducer Imports

export type AddId<T extends Record<string, any>> = T & { id: string };

export interface ProfileType {
  name: string;
  color: string;
  link: string;
  icon: BadgeIcon;
}

export interface StoreSchema {
  profileTypes: ProfileType;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Profile {
  profiles: {
    custom: ProfileType[];
  };
}

interface State {
  firebase: FirebaseReducer.Reducer<Profile, StoreSchema>;
  firestore: FirestoreReducer.Reducer;
}

const reducers = combineReducers<State>({
  firebase: firebaseReducer,
  //@ts-expect-error firestoreReducer does not have correct typings
  firestore: firestoreReducer,
});

const persistConfig = {
  version: 1,
  storage,
  key: "root",
};

const persistedReducer = persistReducer<State>(persistConfig, reducers);

const extraArgument = {
  getFirebase,
  getFirestore,
};

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [
        FLUSH,
        REHYDRATE,
        PAUSE,
        PERSIST,
        PURGE,
        REGISTER,
        ...Object.keys(rfConstants.actionTypes).map(
          (type) => `${rfConstants.actionsPrefix}/${type}`
        ),
        ...Object.keys(rrfActionTypes).map(
          (type) => `@@reactReduxFirebase/${type}`
        ),
      ],
      ignoredPaths: ["firebase", "firestore"],
    },
    thunk: {
      extraArgument,
    },
  }),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

export type AppThunk = ThunkAction<
  void,
  RootState,
  typeof extraArgument,
  Action<string>
>;

export const getState = store.getState;

const persistor = persistStore(store);

firebase.initializeApp(firebaseConfig);

firebase.firestore();
firebase.performance();
firebase.analytics.isSupported().then((supported) => {
  if (supported) firebase.analytics();
});

const ReduxStore: FC = ({ children }) => {
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider
        dispatch={store.dispatch}
        firebase={firebase}
        config={{
          logErrors: true,
          useFirestoreForProfile: true,
          userProfile: "users",
          updateProfileOnLogin: true,
          autoPopulateProfile: true,
        }}
        createFirestoreInstance={createFirestoreInstance}
      >
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </ReactReduxFirebaseProvider>
    </Provider>
  );
};

export default ReduxStore;
