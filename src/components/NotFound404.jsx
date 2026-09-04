import React from 'react'
import assets from '../assets/assets';
import Img from '../components/Image.jsx';

const NotFound404 = ({ value, margin }) => {
  return (
    <div className={`col-span-full text-center h-full flex flex-col justify-center items-center gap-4 ${margin} `}>
      <Img src={assets.not_found} style={'w-30'} />
      <h2>
        {value}
      </h2>
    </div>
  )
}

export default NotFound404;
