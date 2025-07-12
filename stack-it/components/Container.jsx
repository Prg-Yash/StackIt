import React from 'react'

const Container = ({children}) => {
  return (
    <div className='flex justify-center items-center w-full p-4'>
        <div className='max-w-[1800px] w-full'>
            {children}
        </div>
    </div>
  )
}

export default Container