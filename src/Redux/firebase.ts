import { FirebaseReducer, TypeWithId } from "react-redux-firebase";
import { RootState, DefaultProfileType, Profile } from "../Store";

export const getUser = (state: RootState): FirebaseReducer.AuthState =>
  state.firebase.auth;

export const getProfile = (
  state: RootState
): FirebaseReducer.Profile<Profile> => state.firebase.profile;

export const getProfileTypesArr = (
  state: RootState
): TypeWithId<DefaultProfileType>[] => state.firestore.ordered.profileTypes;

export const getProfileTypesObj = (
  state: RootState
): Record<string, DefaultProfileType> => state.firestore.data.profileTypes;
