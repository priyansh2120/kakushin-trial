import React from 'react'
import Expense from "./Expense";
import IncomePage from './Income';

const ExpensePage = () => {
  return (
    <div className='flex justify-center space-x-40 text-white bg-gradient-to-r from-gray-400 to-gray-700'>
      <Expense/>
      <IncomePage/>
    </div>
  )
}

export default ExpensePage
