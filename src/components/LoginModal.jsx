import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import ForgotPasswordModal from './ForgotPasswordModal'
import copy from 'copy-to-clipboard'

const LoginModal = ({ setStep }) => {
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const navigate = useNavigate()

  const location = useLocation()

  axios.defaults.withCredentials = true

  const performLogin = async (loginEmail, loginPassword) => {
    setLoginLoading(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/login`, { email: loginEmail, password: loginPassword }, { withCredentials: true })

      if (data.success) {
        setIsLoggedIn(true)
        await getUserData()

        if (data?.company === '' && data?.role === 'employee') {
          setStep(2)
          toast.info('Please add your company details')
        } else {
          await navigate('/dashboard')
          toast.success(data.message)
        }
      } else {
        toast.error(data.message)
        setIsLoggedIn(false)
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const login = async (e) => {
    e.preventDefault()
    await performLogin(email, password)
  }

  const quickLogin = async (testEmail) => {
    setEmail(testEmail)
    setPassword('Alfa_Careers123')
    await performLogin(testEmail, 'Alfa_Careers123')
  }

  if (showForgotPassword) {
    return <ForgotPasswordModal onBackToLogin={() => setShowForgotPassword(false)} />
  }

  return (
    <div className="flex flex-col w-full justify-center overflow-y-auto items-center">
      <div className={`w-full ${location.pathname === '/login' && "px-8 md:px-32 lg:px-24" } max-w-3xl`}>
        <form onSubmit={login} className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col gap-3">
          {
            location.pathname === "/login" &&
            <div className="w-full max-w-md mx-auto mb-6">
              <div className="bg-[var(--accent-color)] border border-[var(--primary-color)]/20 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-[var(--primary-color)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]" />
                  Quick Login — click to auto-fill & login
                </p>
                <div className="flex flex-col gap-2">
                  <div
                    onClick={() => quickLogin('test@employer.com')}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 cursor-pointer hover:border-[var(--primary-color)] hover:shadow-sm transition-all group"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Employer</p>
                      <p className="text-xs text-gray-500">test@employer.com</p>
                    </div>
                    <span className="text-xs font-medium text-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity">Login →</span>
                  </div>
                  <div
                    onClick={() => quickLogin('test@jobseeker.com')}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 cursor-pointer hover:border-[var(--primary-color)] hover:shadow-sm transition-all group"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Job Seeker</p>
                      <p className="text-xs text-gray-500">test@jobseeker.com</p>
                    </div>
                    <span className="text-xs font-medium text-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity">Login →</span>
                  </div>
                </div>
              </div>
            </div>
          }
          <h1 className="text-gray-800 font-bold text-2xl mb-1">Log<span className="text-[var(--primary-color)]/90">in</span></h1>
          <p className="text-sm font-normal text-gray-600 mb-6">Welcome back 👋</p>

          {/* Email Input */}
          <div className="">
            <label htmlFor="email" className='font-medium text-sm'>Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="">
            <label htmlFor="email" className='font-medium text-sm'>Password</label>
            <div className='flex items-center'>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className='-ml-8 mt-1 cursor-pointer'
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginLoading || password.length === 0 || email === ''}
            className="primary-btn"
          >
            {loginLoading ? 'Loading...' : 'Login'}
          </button>

          {/* Footer Links */}
          <div className="flex justify-between mt-4 text-sm">
            <span
              onClick={() => setShowForgotPassword(true)}
              className="text-gray-500 hover:text-[var(--primary-color)] cursor-pointer transition-colors font-medium"
            >
              Forgot Password?
            </span>
            <Link
              to="/register"
              className="text-gray-500 hover:text-[var(--primary-color)] cursor-pointer transition-colors font-medium"
            >
              Don't have an account yet?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
