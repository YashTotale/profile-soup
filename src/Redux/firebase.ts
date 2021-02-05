import { FirebaseReducer } from "react-redux-firebase";
import { RootState, ProfileType, AddId } from "../Store";

export const getUser = (state: RootState): FirebaseReducer.AuthState =>
  state.firebase.auth;

export const getProfileTypesArr = (state: RootState): AddId<ProfileType>[] =>
  state.firestore.ordered.profileTypes;
