const User = require('../models/user');

exports.userById = async (req,res,next,id) => {
    try {
        const user = await User.findById(id);
        if(!user) {
            return res.status(400).json({
                error: 'User not found'
            })
        }
        req.profile = user;
        next();
    } catch(error) {
        res.status(400).json({
            error: 'Something went wrong'
        });
    } 
}

exports.read = (req,res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}

exports.update = async (req,res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            {_id: req.profile._id},
            {$set: req.body},
            {new: true});

        updatedUser.hashed_password = undefined;
        updatedUser.salt = undefined;
        return res.json(updatedUser);

    } catch(error) {
        res.status(400).json({
            error: 'You are not authorized to perform this action' 
        }); 
    }
}