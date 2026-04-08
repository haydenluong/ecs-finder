import logo from "../assets/logo.jpg";
import { FaPaperPlane } from "react-icons/fa";

function Navbar() {
    return ( 
        <nav className="flex justify-between items-center bg-white sticky top-0 z-20 px-3 py-1.5 md:px-8 md:py-1.5">
            <div className="navbar-left flex items-center space-x-3">
                <img src={logo} alt="Picture of ECs Finder logo" className="rounded-2xl w-10 h-10 md:w-11 md:h-11" />
                <span className="font-bold text-base md:text-lg bg-gradient-to-t from-[#56CCF2] to-[#2F80ED] bg-clip-text text-transparent">ECs Finder</span>
            </div>
            <div className="navbar-center hidden md:flex space-x-14">
                <a href="#" className="font-bold hover:text-blue-500">Trang chủ</a>
                <a href="#" className="hover:text-blue-500">Giới thiệu/FAQ</a>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
                <a href="https://translate.google.com/translate?sl=vi&tl=en&u=https://ecs-finder.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-medium border border-blue-300 text-blue-500 hover:bg-blue-50 rounded-full px-2.5 py-1 md:px-3 md:py-1.5 transition-colors">
                    EN
                </a>
                <a href="https://forms.gle/xfmn8WT8c93NhtzNA" target="_blank" className="flex items-center bg-blue-400 text-white gap-1.5 navbar-right rounded-full hover:bg-blue-600 hover:cursor-pointer px-3 py-1.5 text-sm md:px-4 md:py-1.5 md:text-sm">
                    <FaPaperPlane/>
                    Gửi hoạt động</a>
            </div>
        </nav>
    )


} 

export default Navbar;
