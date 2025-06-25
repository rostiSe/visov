import { Profile, User } from "./generated/client";

export type UserDto = Pick<User, 'id' | 'email' | 'name' | 'image'>;

export type ProfileDto = Pick<Profile, 'id' | 'username' | 'profilePicture' | 'bio' | 'location'>;

export type AuthenticatedUserDto = {
    user: UserDto;
    profile: ProfileDto;
};
