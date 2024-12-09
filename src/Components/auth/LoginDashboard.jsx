import React from 'react'

const LoginDashboard = () => {
  return (
      <div className='w-full h-screen flex  justify-center items-center ' style={{ backgroundPosition:'center', background: 'url(https://img.freepik.com/free-photo/3d-view-planet-earth_23-2150499236.jpg?t=st=1733390467~exp=1733394067~hmac=f48e303cb01dd0b08132801a2d1b23f9cd6b84fd0641015913cc41b8e50a91eb&w=1060)' }}>
          <div className='px-10 py-5 rounded-xl backdrop-blur-3xl bg-white/30 flex flex-col gap-4'>
              <h2 className='text-white font-bold text-2xl text-center'>Login using your account</h2>
              <form className='flex flex-col gap-4'>
                  
              <input type="text" className='p-2 h-8 w-96 rounded-lg ring-0 text-center font-semibold outline-cyan-400' placeholder='username'/>
                  <input type="text" className='p-2 h-8 w-96 rounded-lg ring-0 text-center font-semibold outline-cyan-400' placeholder='password' />
                  <button className='rounded-xl bg-cyan-500 font-bold text-white py-2'>Log in</button>
              </form>
          </div>
    </div>
  )
}

export default LoginDashboard