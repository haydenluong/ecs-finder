import { FaSearch } from "react-icons/fa";
import {useState} from 'react';

function SearchBar( {onSearch} ) {
    const [searchTerm, setSearchTerm] = useState('')

    // handles when the user types 
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);

    }

    return (
        <div className="flex justify-center cursor-pointer  ">
            <div className="flex items-center rounded-full shadow-lg px-6 py-3 gap-3 w-full max-w-2xl bg-white">
                <FaSearch/>
                <input type="text" placeholder="Tìm theo tên hoạt động, dự án..." 
                className="flex-1 outline-none"
                value = {searchTerm}
                onChange={handleSearch}
                />
            </div>

        </div>
    )
};

export default SearchBar;

//  logic for future reference: 
// so for the local input, onChange calls handle search which tracks for what the user typed and then setSearchTerm sets searchterm to value, which is then displayed on the input on value 

// for the parent, onsearch(value) passes up to the parent component (MainContent) to start filtering results,