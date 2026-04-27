import SearchInput from '../../../components/common/SearchInput';

const Header = ({ searchQuery, setSearchQuery }) => {
    return (
        <header className="bg-card border-b border-border sticky top-0 z-10">
            <div className="w-full px-6 lg:px-10 py-4">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Tìm kiếm thông báo..."
                />
            </div>
        </header>
    );
};

export default Header;
