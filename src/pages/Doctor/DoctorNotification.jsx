import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { DoctorContext } from '../../context/DoctorContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const DoctorNotification = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { dToken } = useContext(DoctorContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!dToken) {
      navigate('/doctor-login')
      return
    }

    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const response = await axios.get('/api/doctor/notifications', {
          headers: { dToken }  // consistent casing
        })
        setNotifications(response.data.notifications || [])
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
        toast.error('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [dToken, navigate])

  if (loading) {
    return <p className="p-5 max-w-3xl mx-auto text-center">Loading notifications...</p>
  }

  return (
    <div className='p-5 max-w-3xl mx-auto'>
      <h2 className='text-2xl font-semibold mb-4'>Notifications</h2>
      {notifications.length === 0 ? (
        <p className='text-gray-500'>No notifications available.</p>
      ) : (
        <ul className='space-y-4'>
          {notifications.map((note) => (
            <li key={note._id || note.createdAt} className='border p-4 rounded shadow-sm bg-white'>
              <p className='text-gray-800'>{note.message}</p>
              <p className='text-xs text-gray-400 mt-1'>
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DoctorNotification
