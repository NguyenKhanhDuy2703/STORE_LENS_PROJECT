const mongoose = require("mongoose");
const User = require("../../src/schemas/user.schema");
const Location = require("../../src/schemas/location.schema");
const { hashPassword } = require("../../src/middlewares/security.middleware");
const createUserWithRoleAdmin = async () => {
    const hashedPassword = await hashPassword("admin123");
    const user = new User({
        account: "admin",
        password: hashedPassword,
        email: "admin123@gmail.com",
        location_id: new mongoose.Types.ObjectId().toString(),
        role: "ADMIN",
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
        location_id: new mongoose.Types.ObjectId().toString(),
        role: "USER",
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
        location_id: new mongoose.Types.ObjectId().toString(),
        role: "MANAGER",
    });
    await user.save();
    return user;
}
const createTestLocation = async (name = "Test Location") => {
    const location = new Location({
        location_code: `TEST_${Date.now()}`,
        name: name,
        address: "123 Test Street",
        type_model: "RETAIL",
        manager_info: {
            name: "Test Manager",
            phone: "0123456789",
            email: "manager@test.com"
        },
        business_hours: {
            open: "08:00",
            close: "20:00",
            timezone: "Asia/Ho_Chi_Minh"
        }
    });
    await location.save();
    return location;
};

module.exports = { createUserWithRoleAdmin, createUserWithRoleUser, createUserWithRoleManager, createTestLocation }