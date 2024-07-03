import React from 'react'
import Expense from "./Expense";
import IncomePage from './Income';

const ExpensePage = () => {
  return (
    <div className='flex justify-center space-x-40'>
      <Expense/>
      <IncomePage/>
    </div>
  )
}

export default ExpensePage
