import { Search } from "lucide-react";

function SearchInput({ value, onChange, placeholder = "Search" }) {
  return (
    <div className="search-input">
      <Search size={16} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

export default SearchInput;
