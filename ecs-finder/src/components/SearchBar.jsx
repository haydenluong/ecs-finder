import { FaSearch } from "react-icons/fa";

function SearchBar() {
    return (
        <div className="flex justify-center cursor-pointer  ">
            <div className="flex items-center rounded-full shadow-lg px-6 py-3 gap-3 w-full max-w-2xl bg-white">
                <FaSearch/>
                <input type="text" placeholder="Tìm theo tên hoạt động, dự án..." className="flex-1 outline-none"/>
            </div>

        </div>
    )
};

export default SearchBar;