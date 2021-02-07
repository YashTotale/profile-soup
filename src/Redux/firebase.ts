import { FirebaseReducer, TypeWithId } from "react-redux-firebase";
import {
  RootState,
  DefaultProfileType,
  Profile,
  CreatedProfileType,
} from "../Store";

export const getUser = (state: RootState): FirebaseReducer.AuthState =>
  state.firebase.auth;

export const getProfile = (
  state: RootState
): FirebaseReducer.Profile<Profile> => state.firebase.profile;

export const getDefaultProfilesArr = (
  state: RootState
): TypeWithId<DefaultProfileType>[] => state.firestore.ordered.defaultProfiles;

export const getDefaultProfilesObj = (
  state: RootState
): Record<string, DefaultProfileType> => state.firestore.data.defaultProfiles;

export const getExistingDefaultProfilesArr = (
  state: RootState
): TypeWithId<CreatedProfileType>[] =>
  state.firestore.ordered.existingDefaultProfiles;

export const getExistingDefaultProfilesObj = (
  state: RootState
): Record<string, CreatedProfileType> =>
  state.firestore.data.existingDefaultProfiles;
