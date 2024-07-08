import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, RouterProvider, Routes, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Ai from './components/Tic_Tac_computer.jsx'
import Player from './components/Tic_Tac_Toe.jsx'
import MultiMode from './components/MultiPlayer.jsx'


const router = createBrowserRouter(
  createRoutesFromElements(
   <Route path='/' element={<App/>}>
      <Route path='/' element={<Player/>}/>
      <Route path='/Ai' element={<Ai/>}/>
      <Route path='/Multi' element={<MultiMode/>}/>
   </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
)
