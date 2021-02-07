import { FirebaseReducer } from "react-redux-firebase";
import { RootState, ProfileType, AddId, Profile } from "../Store";

export const getUser = (state: RootState): FirebaseReducer.AuthState =>
  state.firebase.auth;

export const getProfile = (
  state: RootState
): FirebaseReducer.Profile<Profile> => state.firebase.profile;

export const getProfileTypesArr = (state: RootState): AddId<ProfileType>[] =>
  state.firestore.ordered.profileTypes;

export const getProfileTypesObj = (
  state: RootState
): Record<string, ProfileType> => state.firestore.data.profileTypes;
