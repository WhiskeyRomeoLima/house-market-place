import { useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
//import ListingItem from '../components/ListingItem'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'


function Profile() {
  const auth = getAuth()  

  const displayName = auth.currentUser.displayName
  const displayEmail = auth.currentUser.email

  const [formData, setFormData] = useState({name: displayName, email: displayEmail})
  const [changeDetails, setChangeDetails] = useState(false)

  const { name, email} = formData
  const navigate = useNavigate()

  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }

  const onSubmit = async () => {
    if(displayName !== name) {
      console.log(`displayName: ${displayName} name: ${name}`);
    }
    try {
      if (auth.currentUser.displayName !== name) {
        // Update display name in fb
        await updateProfile(auth.currentUser, {
          displayName: name,
        })

        // Update in firestore
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name,
        })
      }
    } catch (error) {
      console.log(error)
      toast.error('Could not update profile details')
    }
  }

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }


  return ( 
    <div className='profile'>
      <header className='profileHeader'>
        <p className="pageHeader">My Profile</p>
        <button type='button' className='logOut' onClick={onLogout}>
          Log Out
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p className="changePersonalDetails" onClick={() => {
            changeDetails && onSubmit()
            setChangeDetails((prev) => !prev)} //toggles changeDetails in state
            }
          >
            {changeDetails ? 'done' : 'change'}
          </p>  
        </div>
        <div className="profileCard">
          <input 
            type="text" 
            id="name"          
            className={!changeDetails ? 'profileName' : 'profileNameActive'} 
            disabled={!changeDetails}
            value={name}
            onChange = {onChange}
          />
          <input 
            type="text" 
            id="email"          
            className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} 
            disabled={!changeDetails}
            value={email}
            onChange = {onChange}
          />
        </div>

      </main>
    </div>
  )
}
export default Profile