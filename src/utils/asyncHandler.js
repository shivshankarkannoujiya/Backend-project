// TODO: Using Promises
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))
        .catch((err) => next(err))
    }
}

export {asyncHandler}








// const asyncHandler = () => {}
// const asyncHandler = (fn) => {() => {}} or
// const asyncHandler = (fn) => async() => {} or


// TODO: Using Try catch
// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: true,
//             message: error.message
//         })
//     }
// }

