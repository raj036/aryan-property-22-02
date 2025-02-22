import React, { useEffect, useState , useRef} from "react";
import CommercialPropertyModal from "./CommercialPropertyModal";
import axios from "../helper/axios";

const PropertyTypeDropdown = ({ onChange }) => {
  const [selectedType, setSelectedType] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ProCategories, setProCategories] = useState([]);
  const [id, setId] = useState("");
  
  const dropdownRef = useRef(null);

  const ProTypes = async () => {
    try {
      const response = await axios.get("/api/property_types/");
      setProCategories(response.data);
      // console.log(response.data);
    } catch (error) {
      console.error("Error fetching property types:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    ProTypes();
  }, []);

  useEffect(() => {
    // console.log("Updated Property Categories:", ProCategories);
  }, [ProCategories]);

  const handleTypeSelect = (type) => {
    console.log(type.type_id);
    setId(type.type_id);
    setSelectedType(type.category);
    setShowDropdown(false);

    // Pass the selected value and type_id to the parent component
    if (onChange) {
      onChange(type.type_id);
    }
  };
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold">Property Type</label>
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex mt-[8px]"
      >
        <input
          type="text"
          value={selectedType}
          readOnly
          className="h-10 w-full p-[12px] border border-[#D3DAEE] rounded-lg shadow-sm cursor-pointer"
        />
        <img
          className={`object-none absolute bottom-4 right-[8px] ${
            showDropdown && "rotate-180"
          } `}
          src="./LeftColumn/Closed.png"
          alt="dropdown indicator"
        />
      </div>
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {ProCategories.map((item) => (
            <div
              key={item.type_id}
              className="p-3 cursor-pointer hover:bg-blue-500 hover:text-white"
              onClick={() => handleTypeSelect(item)}
            >
              {item.category}
            </div>
          ))}
        </div>
      )}
      <CommercialPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        id={id}
      />
    </div>
  );
};

export default PropertyTypeDropdown;
