import logo from "../assets/logo.jpg";
import { FaPaperPlane } from "react-icons/fa";

function Navbar() {
    return ( 
        <nav className="flex justify-between items-center bg-white sticky top-0 z-20 px-6 py-2">
            <div className="navbar-left flex items-center space-x-3">
                <img src={logo} alt="Picture of ECs Finder logo" className="rounded-2xl w-16 h-16" />
                <span className="font-bold text-xl bg-gradient-to-t from-[#56CCF2] to-[#2F80ED] bg-clip-text text-transparent">ECs Finder</span>
            </div>
            <div className="navbar-center flex space-x-14">
                <a href="#" className="font-bold hover:text-blue-500">Trang chủ</a>
                <a href="#" className="hover:text-blue-500">Giới thiệu/FAQ</a>
            </div>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLScvpmn6Rx2NmEWxVAt6l-cZKDyV_Puswnw9DqUxbKLecDPNJA/viewform?usp=header" target="_blank" className="flex items-center bg-blue-400 text-white gap-2 navbar-right rounded-full hover:bg-blue-600 hover:cursor-pointer px-4 py-2">
                <FaPaperPlane/>
                Gửi hoạt động</a>
        </nav>
    )


} 

export default Navbar;
