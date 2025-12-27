function FilterRight() {
    return ( 
        <div>
            <div className="bg-white rounded-lg max-w-xs p-6 ml-4 mt-6 shadow-md">
                <h3 className="font-bold mb-4 text-xl">Chủ đề</h3>
                <label className="flex mb-2 gap-2 cursor-pointer">
                    <input 
                    type="checkbox" 
                    name="category" 
                    className="w-4 h-4 accent-blue-500"/>
                    <span>Dự án</span>
                </label>

                <label className="flex mb-2 gap-2 cursor-pointer">
                    <input type="checkbox" 
                    name="category" 
                    className="w-4 h-4 accent-blue-500 cursor:pointer"/>
                    <span>Cuộc thi</span>
                </label>

                <label className="flex gap-2 cursor-pointer">
                    <input type="checkbox" name="category" className="w-4 h-4 accent-blue-500"/>
                    <span>Sự kiện/Workshop</span>
                </label>
                </div>
            <div>

            <div className="bg-white rounded-lg max-w-xs p-6 ml-4 mt-6 shadow-md">
                <h3 className="font-bold mb-4 text-xl">Thời hạn đăng ký</h3>
                <label className="flex mb-2 gap-2 cursor-pointer">
                    <input type="checkbox" name="deadline" className="w-4 h-4 accent-blue-500"/>
                    <span>Sắp hết hạn (≤ 7 ngày)</span>
                </label>

                <label className="flex mb-2 gap-2 cursor-pointer">
                    <input type="checkbox" name="deadline" className="w-4 h-4 accent-blue-500 cursor:pointer"/>
                    <span>Còn 1–2 tuần</span>
                </label>

                <label className="flex gap-2 cursor-pointer">
                    <input type="checkbox" name="deadline" className="w-4 h-4 accent-blue-500"/>
                    <span>Còn trên 2 tuần</span>
                </label>
                </div>
            

            </div>
        </div>
    )
}
export default FilterRight;