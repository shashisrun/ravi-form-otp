import React from 'react'
import { setUpRecaptcha, addNamedDocument, getDocuments, where, addDocument } from './firebase';
import './App.css';

function App() {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [confirmObject, setConfirmObject] = React.useState(null);
  const [OTP, setOTP] = React.useState('')
  const [terms, setTerms] = React.useState(false)
  const [error, setError] = React.useState('');

  
  const getUserByPhone = async () => {
    if (phone === '') return
    return await getDocuments('users', where("phone", "==", phone))
  }

  const getUserByEmail = async () => {
    if (email === '') return
    return await getDocuments('users', where("email", "==", email))
  }

  const sendOTP = async (event) => {
    event.preventDefault();
    if (phone.length !== 10) {
      setError('Please Enter valid number')
      return;
    }

    try {
      const user = await getUserByPhone()
      console.log(user)
      if (user.length) {
        setError('User Exist with this Phone')
        return
      }
      const reponse = await setUpRecaptcha("+91" + phone)
      setConfirmObject(reponse);
    } catch (error) {
      console.log(error)
        setError(error.message);
    }            
  }

  const verifyOTP = async (event) => {
    event.preventDefault();
    if (OTP.length !== 6) {
      setError('Please Enter a Valid OTP')
      return;
    }   
    try {
        setError(null);
        const reponse = await confirmObject.confirm(OTP)
        console.log(reponse);
    } catch (error) {
        setError(error.message);
    }
  }


  const saveUser = async (event) => {
    event.preventDefault()
    const user = await getUserByEmail()
    if (user.length) {
      setError('User Exist with this email')
      return
    }
    await addDocument('users', {
      name: name,
      email: email,
      phone: phone,
    })
  }


  return (
    <div className="App">
      <form onSubmit={saveUser}>
        <div>
          <label>
            Name
            <input type='text' placeholder='Enter Name' onChange={(e) => setName(e.target.value)} value={name} />
          </label>
        </div>
        <div>
          <label>
            Email
            <input type='text' placeholder='Enter Email' onChange={(e) => setEmail(e.target.value)} value={email} />
          </label>
        </div>
        <div>
          <label>
            Phone
            <input type='text' placeholder='Enter Phone' onChange={(e) => setPhone(e.target.value)} value={phone} />
          </label>
          <button onClick={sendOTP}>
            Send OTP
          </button>
          <div>
            <div id='recaptcha-container'></div>
          </div>
        </div>
        <div>
          <label>
            OTP
            <input type='text' placeholder='Enter OTP' onChange={(e) => setOTP(e.target.value)} value={OTP} />
          </label>
          <button onClick={verifyOTP}>
            Verify OTP
          </button>
        </div>
        <div>
          <label>
            Please Accept
            <input type='checkbox' checked={terms} onChange={() => setTerms(!terms)} />
          </label>
        </div>
        <div>
          <label>
            <input type='submit' />
          </label>
        </div>
        <div>
          {error}
        </div>
      </form>
    </div>
  );
}

export default App;
