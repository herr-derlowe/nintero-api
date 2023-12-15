const yup = require('yup');

const PASSWORD_REGEX = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,})/

let registerSchema = yup.object({
    nombre: yup.string().required(),
    apellido: yup.string().required(),
    username: yup.string().required(),
    email: yup.string().email().required(),
    profileURL: yup.string().url(),
    password: yup.string().matches(PASSWORD_REGEX, 'Password must contain uppercase and lowercase letters, a number and a special character. Plus be at least 8 characters long').required(),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], "Password do not match")
}).required();

let loginSchema = yup.object({
    email: yup.string().email('Not a valid email').required('Must provide a user email'),
    password: yup.string().required('Must provide a user password')
}).required();

module.exports = {
    registerSchema,
    loginSchema
}