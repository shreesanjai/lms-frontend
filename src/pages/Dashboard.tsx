import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


const Dashboard = () => {

  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const [values, setValues] = useState("")

  // useEffect(() => {
  //   Func()
  // })

  const Func = async () => {

    try {
      const response = await axios.get(`${baseUrl}/check`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      if (response.status === 200)
        setValues(JSON.stringify(response.data))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);

      navigate('/login')
    }

  }
  return (
    <div className="bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900">
      <div className="flex w-full h-lvh justify-center items-center flex-col gap-4">

        <p>Dashboard</p>

        <p className="font-medium text-xl">{values}</p>
      </div>
    </div>

  )
}

export default Dashboard