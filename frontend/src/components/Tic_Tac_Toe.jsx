import React, { useEffect, useState } from 'react';
import Footer from './Footer';
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
  const [xIsNext, setXIsNext] = useState(true);
  const winner = checkWinner(board);

  const handleClick = (idx) => {
    if (board[idx] || winner) return;
    setBoard(prevBoard => {
      const newBoard = prevBoard.slice();
      newBoard[idx] = xIsNext ? 'X' : 'O';
      return newBoard;
    });
    setXIsNext(!xIsNext);
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
    setXIsNext(true);
  }

  const renderStatus = () => {
    if (winner) {
        return `Winner: ${winner}`;
    } else if (getEmptyCells(board).length === 0) {
       return 'Draw!';
    } else {
      return `Next player: ${xIsNext ? 'X' : 'O'}`;
    }
  };

  useEffect(()=>{
        if(winner||getEmptyCells(board).length === 0){
          setTimeout(()=>{
            clearAll()
          },2000)
        }
  },[winner,getEmptyCells(board).length === 0])

  return (
   <div className='bg-gray-100 h-screen'> 
     <div className="flex flex-col items-center justify-center min-h-full">
     <div className='mb-5'>
        <h1 className="text-3xl text-center text-gray-700">Tic Tac Toe</h1>
    </div>
      <div className="text-3xl mb-4">{renderStatus()}</div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, idx) => renderSquare(idx))}
      </div>
    <Footer/>
    </div>
   </div>
  );
};

export default TicTacToe;
