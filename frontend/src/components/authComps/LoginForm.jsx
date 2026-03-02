import React, { useState } from 'react'
const LoginForm = ({ onLogin, switchToRegister, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password })
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2>login</h2>
      <label htmlFor="email">Email</label>
      <input type="email" placeholder='enter email' id="email" name='email' value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="password">password</label>
      <input type="password" placeholder='enter password' id="passwrod" name='password' value={password} onChange={(e) => setPassword(e.target.value)} />


      <button type='submit'> login </button>
      <span>dont have account</span>
      <span onClick={switchToRegister}>register</span>
       {error && <p style={{ color: 'red' }}>{error}</p>}

    </form>
  )
}

export default LoginForm