import CustomerNavbar from "./Navbars/CustomerNavbar"
import RiderNavbar from "./Navbars/RiderNavbar"
import { useAuth } from "../../context/AuthContext"

const Navbar = () => {
  const { user } = useAuth()
  console.log(user.role)
  if (user?.role === "rider")    return <RiderNavbar />
  if (user?.role === "customer") return <CustomerNavbar />
  return null  // not logged in
}
export default Navbar