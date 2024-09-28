import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"



const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;


  // Validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }



  // Check if user already Exist
  const existedUser = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (existedUser) {
      throw new ApiError(409, "User with email or username already exist")
  }



  // Create user Object : Create entry in db
  const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering User")
  }

  
  return res.status(201).json(
      new ApiResponse(
        200,
        createdUser,
        "User Registered Successfully"
      )
  )

})

export { registerUser }
