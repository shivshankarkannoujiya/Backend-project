import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessAndRefreshToken = async (userId) => {

  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token")
  }

}



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



  // Check for avatar
  // console.log('Files: ', req.files);



  // const avatarLocalPath =  req.files?.avatar[0]?.path;
  // const coverImageLocalPath =  req.files?.coverImage[0]?.path;


  // console.log('Avatar Local Path:', avatarLocalPath); // Add this line for debugging
  // if (!avatarLocalPath) {
  //     throw new ApiError(400, "Avatar file is required!!!")
  // }


  // Upload on Cloudinary
  // const avatar = await uploadOnCloudinary(avatarLocalPath)
  // const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  // console.log('Uploaded Avatar:', avatar);
  

  // check for avatar after uploading
  // if (!avatar) {
  //     throw new ApiError(400, "Avatar file is required")
  // }


  // Create user Object : Create entry in db
  const user = await User.create({
      fullName,
      // avatar: avatar.url,
      // coverImage: coverImage?.url || "",
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



const loginUser = asyncHandler(async (req, res) => {

  // TODO: 
    // req body -> data 
    // username or email
    // find user 
    // password -> check if(user exist)
    // AccessToken and refreshToken if(password === correct)
    // Send Cookies
    // Send Response

    const {email, username, password} = req.body

    if (!username || !email) {
        throw new ApiError(400, "username or email required")
    }


    const user =   await User.findOne({
      $or: [{username}, {email}]
    })

    if (!user) {
      throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )

    // Send Cookie
    const options = {
      httpOnly: true,
      secure: true
    }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User loggedIn Successfully"
    )
  )
})


const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined
        }
      },

      {
        new: true
      }
    )


    const options = {
      httpOnly: true,
      secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User loggedOut")
    )
})


export {

    registerUser,
    loginUser,
    logoutUser
}

