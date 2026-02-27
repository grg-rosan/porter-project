import React from 'react'
const LoginForm = ({switchToRegister}) => {
  return (
   <form>
        <h2>login</h2>
        <label htmlFor="email">Email</label>
        <input type="email" placeholder='enter email' id = "email" name='email'/>
        <label htmlFor="password">password</label>
        <input type="password" placeholder='enter password' id = "passwrod" name='password'/>


        <button type='submit'> login </button> 
        <span>dont have account</span>
        <span onClick={switchToRegister}>register</span>
        
    </form>
  )
}

export default LoginForm