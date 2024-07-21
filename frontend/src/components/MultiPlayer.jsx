import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import {io} from 'socket.io-client';

const initialBoard = Array(9).fill(null);
const winningElements = Array(3).fill(null);

const checkWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winningElements[0] = a;
      winningElements[1] = b;
      winningElements[2] = c;
      for(let x of winningElements){
        document.getElementById(x).style.backgroundColor = 'green';
      }
      return board[a];
    }
  }
  return null;
};

const getEmptyCells = (board) => {
  return board.reduce((acc, val, idx) => (val === null ? acc.concat(idx) : acc), []);
};

const TicTacToe = () => {
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [winner, setWinner] = useState(null);
  const [playOnline,setPlayOnline] = useState(false);
  const [socket,setSocket] = useState(null);
  const [playerName,setPlayerName] = useState(null);
  const [opponent,setOpponent] = useState(null);
  const [playingAs,setPlayingAs] = useState(null);
  const [finishedState,setFinishedState] = useState(null);

  const handleClick = (idx) => {
    console.log(currentPlayer+" this is "+playingAs);
  if(currentPlayer !== playingAs){
    return;
  }else{
    if(board[idx] || winner)return;
    const newBoard = board.slice();
    newBoard[idx] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    socket?.emit("moveFromFrontend",{
      board:newBoard,
      sign:currentPlayer
    })
  }
  };

  const renderSquare = (idx) => {
    return (
      <button
        className="w-24 h-24 bg-rose-500 text-2xl flex items-center justify-center"
        onClick={() => handleClick(idx)}
        key={idx}
        id={idx}
      >
        {board[idx]}
      </button>
    );
  };

  const clearAll = ()=>{
    for(let x of winningElements){
      document.getElementById(x).style.removeProperty('background-color');
    }
    winningElements.fill(null);
    setBoard(initialBoard);
  }

  const renderStatus = () => {
    if (winner) {
        return `Winner: ${winner === playingAs ? "You" : opponent}`;
    } else if (getEmptyCells(board).length === 0) {
       return 'Draw!';
    } else {
      return `Next player: ${currentPlayer === playingAs ? "You" : opponent}`;
    }
  };

  useEffect(()=>{
    const win=checkWinner(board);
    if(win){
      setWinner(win);
    }
  },[board])

  useEffect(()=>{
    if(finishedState === "opponet_disconnected"){
      setFinishedState(null);
      clearAll();
    }
  },[finishedState])

  // useEffect(()=>{
  //       if(winner||getEmptyCells(board).length === 0){
  //         setTimeout(()=>{
  //           clearAll()
  //         },2000)
  //       }
  // },[winner,getEmptyCells(board).length === 0])


  socket?.on("opponentLeftMatch", () => {
    setFinishedState("opponentLeftMatch");
  });

  socket?.on("moveFrombackend", (data) => {
    const newBoard = data.board;
    setBoard(newBoard);
    setCurrentPlayer(data.sign === "O" ? "X" : "O");
  });

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("opponet_not_found", function () {
    setOpponent(false);
  });

  socket?.on("opponet_found", function (data) {
    setCurrentPlayer(data.currentPlayer);
    setPlayingAs(data.playingas);
    setOpponent(data.opponetPlayer);
  });


  async function playOnlineClick() {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;
    setPlayerName(username);

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket);
  }

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    return result;
  };


  if(!playOnline){
    return (
      <div className='bg-gray-100 h-screen'> 
        <div className="flex flex-col items-center justify-center min-h-full">
        <div className='mb-5'>
           <h1 className="text-3xl text-center text-gray-700">Tic Tac Toe</h1>
       </div>

       <div className=' w-full flex justify-center items-center h-96'>
       <button className='p-5 bg-blue-300 text-5xl font-bold rounded-3xl hover:bg-yellow-400'
       onClick={playOnlineClick}
       >
        Play Online
       </button>
       </div>

       <Footer/>
       </div>
      </div>
    );
  }

  if(!opponent && playOnline){
    return (
      <div className='bg-gray-100 h-screen'> 
        <div className="flex flex-col items-center justify-center min-h-full">
        <div className='mb-5'>
           <h1 className="text-3xl text-center text-gray-700">Tic Tac Toe</h1>
       </div>

       <div className=' w-full flex justify-center items-center h-96'>
        <p className='text-5xl '>Finding an Opponent.......</p>
       </div>

       <Footer/>
       </div>
      </div>
    );
  }

  return (
   <div className='bg-gray-100 h-screen'> 
     <div className="flex flex-col items-center justify-center min-h-full">
     <div className='mb-5'>
        <h1 className="text-3xl text-center text-gray-700">Tic Tac Toe</h1>
    </div>
      <div className="text-3xl mb-4">{renderStatus()}</div>
      <div className='flex w-80 justify-between my-2'>
         <button className='p-4 bg-blue-300 rounded-2xl'>
          {playerName}
         </button>

         <button className='p-4 bg-blue-300 rounded-2xl'>
          {opponent}
         </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, idx) => renderSquare(idx))}
      </div>
    <Footer/>
    </div>
   </div>
  );
};

export default TicTacToe;
