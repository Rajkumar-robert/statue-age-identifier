import Image from 'next/image'
import React from 'react'
import Marquee from 'react-fast-marquee'

const Slider = () => {
  return (
    <div className=' bg-accent h-fit overflow-hidden select-none' >
      <Marquee play={true} direction='right' speed={200} pauseOnHover>
        <div className='h-48 sm:h-64 flex items-center w-fit overflow-hidden'>
          <Image
            src="/project_images/chennaiconnects.png"
            alt="Chennai Connects project"
            width={600}
            height={1000}
            className='object-cover img slider-img mx-[px]'
          />
        </div>
       
        <div className='h-48 sm:h-64 flex items-center w-fit overflow-hidden'>
          <Image
            src="/project_images/backtothefuture.png"
            alt="Back to the Future project"
            width={600}
            height={1000}
            className='object-cover img slider-img mx-[px]'
          />
        </div>
        {/* <div className=' h-48 sm:h-64 flex items-center w-fit overflow-hidden '>
          <Image
            src="/project_images/notes1.png"
            alt="Notes project"
            width={600}
            height={1000}
            className='object-cover img slider-img mx-[px]'
          />
        </div> */}
        <div className='h-48 sm:h-64 flex items-center w-fit overflow-hidden'>
          <Image
            src="/project_images/agrolink.png"
            alt="Agro Link project"
            width={600}
            height={1000}
            className='object-cover img slider-img mx-[px]'
          />
        </div>
        <div className='h-48 sm:h-64 flex items-center w-fit overflow-hidden'>
          <Image
            src="/project_images/ownyourtune.png"
            alt="Own Your Tune project"
            width={600}
            height={1000}
            className='object-cover img slider-img mx-[px]'
          />
        </div>
      </Marquee>
    
      </div>
  )
}

export default Slider
