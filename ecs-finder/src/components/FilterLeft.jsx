function FilterLeft({onCategoryChange, onDeadlineChange, selectedCategory = '', selectedDeadline = ''}) {

    const categories = [
    'Dự án & CLB',
    'Cuộc thi (Tổ chức cuộc thi)',
    'Cuộc thi (Tham gia cuộc thi)', 
    'Sự kiện (Workshop, Talkshows, ...)',
];

const deadlineOptions = [
    { label: 'Trong 3 ngày', value: '3' },
    { label: 'Dưới 1 tuần', value: '7' },
    { label: 'Dưới 2 tuần', value: '14' },
    { label: 'Dưới 1 tháng', value: '30' },
    { label: 'Trên 1 tháng', value: '31' }
];

    const handleCategoryChange = (category) => {
        onCategoryChange?.(category);
    };

    const handleDeadlineChange = (value) => {
        onDeadlineChange?.(value);
    };

    return (
        <div>
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg max-w-xs p-6 ml-4 mt-6 shadow-md">
                <h3 className="font-bold mb-4 text-xl" style={{
                background: 'linear-gradient(45deg, #3a7bd5 0.000%, #3d6ff0 25.000%, #5a7fff 50.000%, #7b6fef 75.000%, #9b4dca 100.000%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
                }}>Thể loại</h3>
                {categories.map((category) => (
                   <label key={category} className="flex mb-2 gap-2 cursor-pointer">
                    <input 
                    type="radio" 
                    name="category" 
                    className="w-4 h-4 accent-blue-500"
                    checked = {selectedCategory === category}
                    onChange = {() => handleCategoryChange(category)}
                    />
                    <span>{category}</span>
                </label> 
                ))}
                {selectedCategory && (
                    <button 
                    className="text-sm text-blue-500 hover:text-blue-700 mt-2"
                    onClick = {() => handleCategoryChange('')}>
                        Xóa bộ lọc
                    </button>
                )}
                </div>
            <div>

            <div className="bg-sky-50 border-l-4 border-sky-400 rounded-lg max-w-xs p-6 ml-4 mt-6 shadow-md">
                <h3 className="font-bold mb-4 text-xl text-sky-600">Thời hạn đăng ký</h3>
                {deadlineOptions.map((option) => (
                    <label key={option.value} className="flex mb-2 gap-2 cursor-pointer">
                    <input type="radio" name="deadline" className="w-4 h-4 accent-blue-500"
                    checked = {selectedDeadline === option.value}
                    onChange = {() => handleDeadlineChange(option.value)}
                    />
                    <span>{option.label}</span>
                </label>
                ))}
                {selectedDeadline && (
                <button 
                    onClick={() => handleDeadlineChange('')}
                    className="text-sm text-sky-500 hover:text-sky-700 mt-2"
                >
                    Xóa bộ lọc
                </button>
            )}
                
                </div>
            

            </div>
        </div>
    )
}
export default FilterLeft;