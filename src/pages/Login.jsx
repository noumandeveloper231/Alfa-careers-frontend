import { useEffect, useState } from 'react'
import assets from '../assets/assets'
import LoginModal from '../components/LoginModal'
import DetailsModal from '../components/DetailsModal'
import Img from '../components/Image'

const Login = () => {
    // Auto Scroll to Top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [])
  const [step, setStep] = useState(1);

  return (
    <main className="max-h-screen overflow-hidden w-full flex justify-center items-center">
      <div className="md:w-1/2 py-10 overflow-y-auto max-h-screen">
        {step === 1 ? <LoginModal setStep={setStep} /> : <DetailsModal />}
      </div>
      {step === 1 && <div className="border hidden md:block md:w-1/2 border-l-3 border-[var(--primary-color)]">
        <Img src={assets.register_side} />
      </div>}
    </main>
  )
}

export default Login