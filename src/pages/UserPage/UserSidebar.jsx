import { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import { Box } from "@mui/material";
import { useLogin } from "../../hooks/LoginContext";

const UserSidebar = ({ properties = [], currentFilters, onFilterChange }) => {
  const MIN_PRICE = 1000;
  const MAX_PRICE = 1000000;
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [anyPrice, setAnyPrice] = useState(false);
  const { logout } = useLogin();
  const [currentDate, setCurrentDate] = useState("");

  const handleLogOut = () => {
    logout();
  };

  // useEffect(() => {
  //   let filtered = properties;
  //   console.log(filtered);
  //   let pric = currentFilters;
  //   console.log(pric);

  //   if (!anyPrice) {
  //     filtered = filtered.filter(
  //       (property) =>
  //         property.rate_buy >= priceRange[0] &&
  //         property.rate_buy <= priceRange[1],
  //         console.log(properties.rate_buy)
  //     );
  //   }
   
  // }, [anyPrice]);

  useEffect(() => {
    let filtered = [...properties]; // Ensure we are working on a copy

    console.log("Original Properties:", filtered);
    console.log("Current Filters:", currentFilters);

    // Extracting price range from currentFilters
    const { priceRange } = currentFilters;

    if (!anyPrice && priceRange?.length === 2) {
        filtered = filtered.filter((property) => {
            console.log("Property Rate Buy:", property.rate_buy);
            return property.rate_buy >= priceRange[0] && property.rate_buy <= priceRange[1];
        });
    }

    console.log("Filtered Properties:", filtered);

}, [anyPrice, currentFilters, properties]); 

  const handleAnyPriceChange = (event) => {
    setAnyPrice(event.target.checked);
    // If "Any Price" is checked, reset the price range to the full range

    if (event.target.checked) {
      setPriceRange([MIN_PRICE, MAX_PRICE]);
    }
  };

  // Handle price range slider change
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
    onFilterChange({ priceRange: newValue }); // Propagate the change to the parent component
  };

  // Handle city selection
  const handleCityChange = (event) => {
    onFilterChange({
      city: event.target.value,
      propertyType: "", // Reset property type when city changes
    });
  };

  // Handle property type selection
  const handlePropertyTypeChange = (propertyType) => {
    onFilterChange({ propertyType });
  };

  // Get unique cities from properties
  const availableCities = [...new Set(properties.map((p) => p.city_name))];

  // Get property types based on selected city
  const filteredPropertyTypes = currentFilters.city
    ? [
        ...new Set(
          properties
            .filter((p) => p.city_name === currentFilters.city)
            .map((p) => p.property_type)
        ),
      ]
    : [...new Set(properties.map((p) => p.property_type))];

  // Update current date every second
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(now);
      setCurrentDate(formattedDate);
    };

    updateDate();
    const interval = setInterval(updateDate, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex transition-all duration-300">
      <aside className="w-full p-[15px] bg-white border-r shadow-lg">
        <div className="flex items-center gap-4">
          <img
            src="./LeftColumn/Logo.png"
            alt="logo"
            className="object-contain w-18 h-18"
          />
          <div className="mt-3">
            <h1 className="text-lg font-bold">Welcome, ARYANS</h1>
            <p className="text-sm text-gray-500 mt">{currentDate}</p>
          </div>
        </div>

        {/* City Filter */}
        <div className="p-3 mt-6">
          <label className="block mb-2 font-medium text-gray-500">City</label>
          <select
            className="border rounded p-2 w-[100%]"
            onChange={handleCityChange}
            value={currentFilters.city}
          >
            <option value="">All Cities</option>
            {availableCities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type Filter */}
        <div className="p-3">
          <h2 className="mb-3 font-medium text-gray-500">Property Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {filteredPropertyTypes.map((type, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={type}
                  onChange={() => handlePropertyTypeChange(type)}
                  checked={currentFilters.propertyType === type}
                />
                <span className="mx-2">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm p-3">
          <label className="block mb-2 font-medium text-gray-500">
            Price Range
          </label>
          <Box sx={{ width: "100%", paddingBottom: "1rem" }}>
            <Slider
              value={currentFilters.priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value.toLocaleString()}`}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1000}
              disabled={anyPrice}
              sx={{
                "& .MuiSlider-thumb": {
                  width: 12,
                  height: 12,
                  backgroundColor: "blue",
                  borderRadius: "50%",
                },
                "& .MuiSlider-rail": {
                  opacity: 0.2,
                },
                "& .MuiSlider-track": {
                  backgroundColor: "blue",
                },
              }}
            />
          </Box>
          <div className="flex items-center justify-between -mt-4 text-sm text-gray-500">
            <div>${currentFilters.priceRange[0].toLocaleString()}</div>
            <div>${currentFilters.priceRange[1].toLocaleString()}</div>
          </div>
        </div>

        {/* Any Price Checkbox */}
        <label className="flex items-center gap-2 p-3">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-500"
            checked={anyPrice}
            onChange={handleAnyPriceChange}
          />
          <span>Any Price</span>
        </label>

        {/* Size Filter */}
        <div className="mt-4">
          <label className="block mb-2 font-medium text-gray-500">Size</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="w-[20%] items-center flex text-gray-500">
              sq ft
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="flex items-center justify-center mt-8 space-x-3">
          <button
            onClick={handleLogOut}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
};

export default UserSidebar;
