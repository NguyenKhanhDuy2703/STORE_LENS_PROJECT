<<<<<<< HEAD
=======
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
const secret = JWT_SECRET || 'test-secret-key-for-jest'; // Default for test environment

const renderToken =  (data) => {
    return  jwt.sign(data , secret, {expiresIn: '1h'});
}
const verifyToken =  (token) => {
   try{
    const decode = jwt.verify(token, secret);
    return decode;
   }catch(error){
       console.log(error);
   }
}
module.exports = {
    renderToken , verifyToken , hashPassword, comparePassword
};
>>>>>>> d9e048f ([MODULE_BE] feat : add testcase auth (login , logout , register ) , fix : auth.controller (use trim() remove space ))
