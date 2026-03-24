const mongoose = require("mongoose");
const User = require("../../src/schemas/user.schema");
const { hashPassword } = require("../../src/middlewares/security.middleware");
const createUserWithRoleAdmin = async () => {
    const hashedPassword = await hashPassword("admin123");
    const user = new User({
        account: "admin",
        password: hashedPassword,
        email: "admin123@gmail.com",
        location_id: new mongoose.Types.ObjectId(),
        role: "admin",
    });
    await user.save();
    return user;
}
const createUserWithRoleUser = async () => {
    const hashedPassword = await hashPassword("user123");
    const user = new User({
        account: "user",
        password: hashedPassword,
        email: "user123@gmail.com",
        location_id: new mongoose.Types.ObjectId(),
        role: "user",
    });
    await user.save();
    return user;
}
const createUserWithRoleManager = async () => {
    const hashedPassword = await hashPassword("manager123");
    const user = new User({
        account: "manager",
        password: hashedPassword,
        email: "manager123@gmail.com",
        location_id: new mongoose.Types.ObjectId(),
        role: "manager",
    });
    await user.save();
    return user;
}
module.exports = { createUserWithRoleAdmin, createUserWithRoleUser, createUserWithRoleManager }