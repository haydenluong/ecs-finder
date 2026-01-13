function FilterRight() {
    const chuDe = ['STEM', 'Thiện nguyện', 'Sức khỏe', 'Nghệ thuật', 'Tiếng Anh', 'Môi trường', 'Văn hóa (của các nước..)', 'Kinh tế']
    const viTriTuyen = ['Ban Nhân Sự', 'Ban Truyền Thông', 'Ban Dịch Thuật', 'Ban Nội Dung', 'Ban Chuyên Môn', 'Ban Thiết Kế', 'Ban Tài chính Đối ngoại', 'CTV Truyền Thông', 'Khác']
    return ( 
        <div>
            <div className="bg-white rounded-lg max-w-xs p-6 mt-6 mr-4 shadow-md">
                <h3 className="font-bold mb-4 text-xl">Chủ đề</h3>
                {chuDe.map((topic) => (
                    <label key={topic} className="flex mb-2 gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-blue-500" />
                        <span>{topic}</span>
                    </label>

                ))}    
            </div>

            <div className="bg-white rounded-lg max-w-xs p-6 mt-6 shadow-md mr-4">
                <h3 className="font-bold mb-4 text-xl">Vị trí tuyển: </h3>
                {viTriTuyen.map((viTri) => (
                    <label key={viTri} className="flex mb-2 gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-blue-500"/>
                        <span>{viTri}</span>
                    </label>
                ))}
            </div>
            

        </div>
    )
}
export default FilterRight;