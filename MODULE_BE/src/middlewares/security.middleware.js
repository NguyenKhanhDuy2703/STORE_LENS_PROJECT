const bcrypt = require('bcrypt');
const saltRounds = 10; 
const  jwt = require('jsonwebtoken');
require('dotenv').config();
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const { JWT_SECRET} = process.env;

const renderToken =  (data) => {
    return  jwt.sign(data , JWT_SECRET, {expiresIn: '1h'});
}
const verifyToken =  (token) => {
   try{
    console.log("JWT_SECRET:", JWT_SECRET);
    const decode = jwt.verify(token, JWT_SECRET);
    return decode;
   }catch(error){
       console.log(error);
   }
}
module.exports = {
    renderToken , verifyToken , hashPassword, comparePassword
};
