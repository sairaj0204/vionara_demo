require('dotenv').config();
const mongoose = require('mongoose');

async function getAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.connection.collection('users');
        const adminUser = await User.findOne({ role: 'admin' });
        
        if (adminUser) {
            console.log("Admin user found in DB:");
            console.log("Name:", adminUser.name);
            console.log("Email:", adminUser.email);
            console.log("Password hash exists. (Cannot decrypt bcrypt)");
        } else {
            console.log("No admin user found in the DB. Let's create one!");
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 12);
            await User.insertOne({
                name: 'System Admin',
                email: 'admin@vionara.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("Successfully created default admin!");
            console.log("Email: admin@vionara.com");
            console.log("Password: admin123");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
getAdmin();
