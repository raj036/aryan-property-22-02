import { useEffect, useState, useRef } from "react";
import CommercialPropertyModal from "./CommercialPropertyModal";
import axios from "../helper/axios";

const DescriptionTypeDropdown = ({ onChange }) => {
  const [selectedType, setSelectedType] = useState({}); // Store selected object
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [DesId, setDesId] = useState("");

  const dropdownRef = useRef(null);

  const fetchPropertyTypes = async () => {
    try {
      const response = await axios.get("/api/descriptions/");
      setPropertyTypes(response.data);
    } catch (error) {
      console.error("Error fetching descriptions:", error);
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

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

  const handleTypeSelect = (type) => {
    // console.log(type.des_id);
    setDesId(type.des_id);
    setSelectedType(type);
    setShowDropdown(false);

    if (onChange) {
      onChange(type.des_id);
    }

    if (type.description === "Furnished") {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold">Description</label>
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex"
      >
        <input
          type="text"
          value={selectedType.description || ""} // Show description name
          readOnly
          className="h-10 w-full mt-2 p-3 border border-[#D3DAEE] rounded-lg shadow-sm cursor-pointer"
        />
        <img
          className={`object-none absolute bottom-4 right-[8px] ${
            showDropdown && "rotate-180"
          }`}
          src="./LeftColumn/Closed.png"
          alt="dropdown indicator"
        />
      </div>
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {propertyTypes.map((type) => (
            <div
              key={type.des_id} // Use des_code as key
              className="p-3 cursor-pointer hover:bg-blue-500 hover:text-white"
              onClick={() => handleTypeSelect(type)}
              value={selectedType.description || ""}
            >
              {type.description}
            </div>
          ))}
        </div>
      )}
      <CommercialPropertyModal
        isOpen={isModalOpen}
        DesId={DesId}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DescriptionTypeDropdown;
