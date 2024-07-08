import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <div className='flex gap-6 my-2' >
         <Link to='/Ai' className='btn btn-ghost'>
           <button className='p-2 rounded-xl bg-gray-400'>
                Play with AI
           </button>
           </Link>
           <Link to='/' className='p-2 rounded-xl bg-gray-400'>
           <button>
                 Play with Player
           </button>
           </Link>
           <Link to='/Multi' className='p-2 rounded-xl bg-gray-400'>
           <button>
                 Play online
           </button>
           </Link>
    </div>
  )
}

export default Footer