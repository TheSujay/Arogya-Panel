import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { FaBell } from 'react-icons/fa'

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }
    if (aToken) {
      setAToken('')
      localStorage.removeItem('aToken')
    }
  }

  const handleNotificationClick = () => {
    if (aToken) {
      navigate('/admin/update-requests')
    } else if (dToken) {
      navigate('/doctor/notifications')
    }
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img
          onClick={() => navigate('/')}
          className='w-36 sm:w-40 cursor-pointer'
          src={assets.admin_logo}
          alt="logo"
        />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>
          {aToken ? 'Admin' : 'Doctor'}
        </p>

        {/* Show bell if admin or doctor is logged in */}
        {(aToken || dToken) && (
          <FaBell
            className='ml-3 text-lg text-gray-600 cursor-pointer hover:text-primary'
            title="Notifications"
            onClick={handleNotificationClick}
          />
        )}
      </div>

      <button
        onClick={logout}
        className='bg-primary text-white text-sm px-10 py-2 rounded-full'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar
