const yup = require('yup');
const mongoose = require('mongoose');

const PASSWORD_REGEX = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,})/
const BILLING_MODE_REGEX = /(INC|DEC)/

let registerSchema = yup.object({
    nombre: yup.string().required(),
    apellido: yup.string().required(),
    username: yup.string().required(),
    email: yup.string().email().required(),
    profileURL: yup.string().url('Not a valid profile URL'),
    password: yup.string().matches(PASSWORD_REGEX, 'Password must contain uppercase and lowercase letters, a number and a special character. Plus be at least 8 characters long').required(),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], "Passwords do not match").required()
}).required();

let registerUserAdminSchema = yup.object({
    nombre: yup.string().required(),
    apellido: yup.string().required(),
    username: yup.string().required(),
    email: yup.string().email().required(),
    profileURL: yup.string().url('Not a valid profile URL'),
    password: yup.string().matches(PASSWORD_REGEX, 'Password must contain uppercase and lowercase letters, a number and a special character. Plus be at least 8 characters long').required(),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], "Passwords do not match").required(),
    // tipos de usuario. 0 admin, 1 developer, 2 normal
    tipo: yup.number().min(0).max(2).required(),
    billetera: yup.number().min(0).required(),
    blocked: yup.boolean().required()
}).required();

let loginSchema = yup.object({
    email: yup.string().email('Not a valid email').required('Must provide a user email'),
    password: yup.string().required('Must provide a user password')
}).required();

let editUserSchema = yup.object({
    nombre: yup.string(),
    apellido: yup.string(),
    profileURL: yup.string().url('Not a valid profile URL'),
    username: yup.string(),
    email: yup.string().email('Not a valid email')
}).required().noUnknown(true).strict();

let editUserAdminSchema = yup.object({
    userid: yup.string().test({
        name: "valid-mongodb-id-userid",
        message: "Invalid user ObjectId",
        test: (value) => {
          return mongoose.Types.ObjectId.isValid(value);
        }}).required(),
    nombre: yup.string(),
    apellido: yup.string(),
    username: yup.string(),
    email: yup.string().email('Not a valid email'),
    profileURL: yup.string().url('Not a valid profile URL'),
    password: yup.string().matches(PASSWORD_REGEX, 'Password must contain uppercase and lowercase letters, a number and a special character. Plus be at least 8 characters long'),
    // tipos de usuario. 0 admin, 1 developer, 2 normal
    tipo: yup.number().min(0).max(2),
    billetera: yup.number().min(0),
    fechaCreacion: yup.date(),
    fechaEdicion: yup.date(),
    blocked: yup.boolean(),
    following: yup.array().of(yup.string().test({
        name: "valid-mongodb-id-following",
        message: "Invalid 'USER' ID in 'following'",
        test: (value) => {
          return mongoose.Types.ObjectId.isValid(value);
        }})),
    followers: yup.array().of(yup.string().test({
        name: "valid-mongodb-id-followers",
        message: "Invalid 'USER' ID in 'followers'",
        test: (value) => {
            return mongoose.Types.ObjectId.isValid(value);
        }})),
    wishlist: yup.array().of(yup.string().test({
        name: "valid-mongodb-id-wishlist",
        message: "Invalid 'GAME' ID in 'wishlist'",
        test: (value) => {
          return mongoose.Types.ObjectId.isValid(value);
        }})),
    libreria: yup.array().of(yup.string().test({
        name: "valid-mongodb-id-libreria",
        message: "Invalid 'GAME' ID in 'libreria'",
        test: (value) => {
          return mongoose.Types.ObjectId.isValid(value);
        }})) 
}).required().noUnknown(true).strict();

let userBillingSchema = yup.object({
    mode: yup.string().uppercase().matches(BILLING_MODE_REGEX, 
        'Billing mode must be either INC for adding money or DEC for substracting it').required(),
    amount: yup.number().positive().required()
}).required();

let passwordUpdateSchema = yup.object({
    oldPassword: yup.string().required(),
    newPassword: yup.string().matches(PASSWORD_REGEX, 'Password must contain uppercase and lowercase letters, a number and a special character. Plus be at least 8 characters long').required(),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], "Passwords do not match").required()
}).required();

let filterUserSchema = yup.object({
    blocked: yup.boolean(),
    tipo: yup.number().integer().min(0).max(2),
    username: yup.string()
}).required().noUnknown(true).strict();

module.exports = {
    registerSchema,
    registerUserAdminSchema,
    loginSchema,
    editUserSchema,
    editUserAdminSchema,
    userBillingSchema,
    passwordUpdateSchema,
    filterUserSchema
}