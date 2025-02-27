export const createUserValidationSchema = {
    email : {
        isLength : {
            options : { min : 3, max : 32 },
            errorMessage : 'email must be between 3 and 32 characters'
        },
        notEmpty : {
            errorMessage : 'email must not be empty'
        },
        isString : {
            errorMessage : 'email must be a string'
        }  
    },
    password : {
        notEmpty : true
    }
} 


export const loginUserValidationSchema = {
    email : {
        isLength : {
            options : { min : 3, max : 32 },
            errorMessage : 'email must be between 3 and 32 characters'
        },
        notEmpty : {
            errorMessage : 'email must not be empty'
        },
        isString : {
            errorMessage : 'email must be a string'
        }  
    },
    password : {
        notEmpty : true
    }
}