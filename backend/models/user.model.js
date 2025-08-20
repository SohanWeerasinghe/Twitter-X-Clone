import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    fullname: { 
        type: String, 
        required: true
    },
    password: { 
        type: String, 
        required: true, 
        minLength: 8
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    followers: [
        {type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: []}
    ], 
    following: [
        {type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: []}
    ],
    profilePicture: { 
        type: String, 
        default: 'default-profile.png' 
    },
    bio: { 
        type: String, 
        default: '' 
    },
    link: { 
        type: String, 
        default: '' 
    },
    coverImg: { 
        type: String, 
        default: 'default-cover.png' 
    },
    likedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: []
        }
    ],
    },{timeseries: true}
);   //timeseries: true is used for time series data

const User = mongoose.model('User', userSchema);
export default User;