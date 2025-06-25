import { Profile, User } from "./generated/prisma";

export type UserDto = Pick<User, 'id' | 'email' | 'name' | 'image'>;

export type ProfileDto = Pick<Profile, 'id' | 'username' | 'profilePicture' | 'bio' | 'location'>;

export type AuthenticatedUserDto = {
    user: UserDto;
    profile: ProfileDto;
};
