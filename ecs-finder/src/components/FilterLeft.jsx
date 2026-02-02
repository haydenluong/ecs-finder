import { useState } from 'react';

function FilterLeft({onCategoryChange, onDeadlineChange}) {
    const [selectedCategories, setSelectedCategories] = useState('');
    const [selectedDeadline, setSelectedDeadline] = useState('');

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
        setSelectedCategories(category);
        onCategoryChange?.(category);
        
    }

    const handleDeadlineChange = (value) => {
        setSelectedDeadline(value);
        onDeadlineChange?.(value);
};

    return (
        <div>
            <div className="bg-white rounded-lg max-w-xs p-6 ml-4 mt-6 shadow-md">
                <h3 className="font-bold mb-4 text-xl">Thể loại</h3>
                {categories.map((category) => (
                   <label key={category} className="flex mb-2 gap-2 cursor-pointer">
                    <input 
                    type="radio" 
                    name="category" 
                    className="w-4 h-4 accent-blue-500"
                    checked = {selectedCategories === category}
                    onChange = {() => handleCategoryChange(category)}
                    />
                    <span>{category}</span>
                </label> 
                ))}
                {selectedCategories && (
                    <button 
                    className="text-sm text-blue-500 hover:text-blue-700 mt-2"
                    onClick = {() => handleCategoryChange('')}>
                        Xóa bộ lọc
                    </button>
                )}
                </div>
            <div>

            <div className="bg-white rounded-lg max-w-xs p-6 ml-4 mt-6 shadow-md">
                <h3 className="font-bold mb-4 text-xl">Thời hạn đăng ký</h3>
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
                    className="text-sm text-blue-500 hover:text-blue-700 mt-2"
                >
                    Xóa lọc
                </button>
            )}
                
                </div>
            

            </div>
        </div>
    )
}
export default FilterLeft;