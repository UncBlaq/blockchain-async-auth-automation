import bcrypt from 'bcrypt';
// How much time it needs to calcculate bcrypt hash(10 recommended)
const saltRounds = 10;

export const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
}

export const comparePassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);
