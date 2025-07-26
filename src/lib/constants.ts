// Define types for profile data
export interface ProfileContent {
  about: string;
  vision: string;
  mission: string;
}

// Default content to be used if the profile document doesn't exist yet.
export const defaultProfileContent: ProfileContent = {
  about: "",
  vision: "",
  mission: ""
};
