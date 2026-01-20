
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'manager'], default: 'customer' },
}, { timestamps: true });

userSchema.pre('save', function () {
    if (!this.isModified('password')) return;

    // bcryptjs hashSync is fast enough for this use case
    this.password = bcrypt.hashSync(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
            if (err) return reject(err);
            resolve(isMatch);
        });
    });
};

module.exports = mongoose.model('User', userSchema);