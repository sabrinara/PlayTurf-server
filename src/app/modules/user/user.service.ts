import bcrypt from "bcrypt";
import { User } from "./user.model";
import { TUser } from "./user.interface";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import config from "../../config";
import { createToken } from "./user.utils";

const userSignUp = async (payload: TUser) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );
  payload.password = hashedPassword;
  const user = await User.create(payload);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    phone: user.phone,
    role: user.role,
    address: user.address,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const jwtPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    phone: user.phone,
    role: user.role,
    address: user.address,
  };

  const token = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      phone: user.phone,
      role: user.role,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
};

// Service function to update user data
const updateUser = async (userId: string, payload: Partial<TUser>) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { ...payload },
    { new: true, runValidators: true }
  ).select("-password"); // Exclude password field from the response

  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  // return updatedUser;
  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    imageUrl: updatedUser.imageUrl,
    phone: updatedUser.phone,
    role: updatedUser.role,
    address: updatedUser.address,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  };
};

// Service to get user by ID
const getUserById = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

// Service function to get all users from the database
const getAllUsers = async () => {
  const users = await User.find().select("-password"); // Exclude password field
  return users;
};

export const UserServices = {
  userSignUp,
  loginUser,
  getAllUsers,
  updateUser,
  getUserById,
};
