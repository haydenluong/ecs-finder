import FilterLeft from './FilterLeft';
import FilterRight from './FilterRight';
import ActivityCards from './ActivityCards';

function MainContent() {
    return (
        <div className="grid grid-cols-[300px_1fr_300px] gap-8 py-8">
            <FilterLeft />
            <div>
                <ActivityCards />
            </div>
            <FilterRight />
        </div>
    );
}

export default MainContent;