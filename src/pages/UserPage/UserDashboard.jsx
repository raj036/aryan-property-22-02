import { useState, useEffect } from "react";
import PropertyForm from "../../components/PropertyForm";
import axios from "../../helper/axios";
import Swal from "sweetalert2";
import UserSidebar from "./UserSidebar.jsx";

const UserDashboard = () => {
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const [filteredPropertiesSidebar, setFilteredPropertiesSidebar] = useState(
    []
  );
  const [filter, setFilter] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [filters, setFilters] = useState({
    propertyType: "",
    city: "",
    priceRange: [1000, 1000000],
    anyPrice: true,
    areaSize: [0, 100000],
  });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isEast, setIsEast] = useState(true);
  const [isWest, setIsWest] = useState(false);
  const MIN_SQFT = 0;
  const MAX_SQFT = 100000;
  const [squareSize, setSquareSize] = useState(["", ""]);
  const [funUnfurn, setFunUnfurn] = useState("");
  const [FilterArea, setFilterArea] = useState([]);
  const [showfilterdata, setshowfilterData] = useState(false);
  const [selectedLLOutright, setSelectedLLOutright] = useState(""); // State for LL/Outright
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [shouldRefreshFilters, setShouldRefreshFilters] = useState(false);

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

  const applyFilter = () => {
    fetchProperties();
    // showFilter();
  };

  const FetchfilterArea = async () => {
    try {
      const response = await axios("/api/filter_area/");
      // console.log(response.data, "filterdata");
      setFilterArea(response.data);
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    fetchProperties();
    FetchfilterArea();
  }, []);

  useEffect(() => {
    if (shouldRefreshFilters) {
      // No need to fetch from API again, just update filtered properties
      const filtered = getFilteredProperties();
      setFilteredPropertiesSidebar(filtered);
      setShouldRefreshFilters(false);
    }
  }, [filters, shouldRefreshFilters]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(
        `/api/get_all_properties/?from_area=${from}&to_area=${to}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data);

      if (!response.data) throw new Error("No data received");

      // Transform the API response to match the expected structure
      const transformedProperties = response.data.map((property) => ({
        building: property.building_name || "-",
        address: property.full_address || "-",
        city_name: property.city || "-",
        location: property.location || "-",
        area_name: property.sublocation || "-",
        property_type: property.property_type || "-",
        lease_type: property.LL_outright || "-",
        c_status: property.poss_status || "-",
        rate_buy: property.areas[0]?.outright_rate_psf || "-",
        rate_lease: property.areas[0]?.rental_psf || "-",
        company: property.contacts[0]?.company_builder_name || "-",
        description: property.description || "-",
        outright: property.LL_outright || "-",
        poss_status: property.poss_status || "-",
        pin_code: "-",
        east_west: property.east_west || "-",
        reopen: property.reopen_data || "-",
        floor: property.areas[0]?.floor_wing_unit_number || "-",
        car_parking: property.areas[0]?.car_parking || "-",
        efficiency: property.areas[0]?.efficiency || "-",
        areas_name: property.areas[0]?.area_name || "-",
        builtup: property.areas[0]?.built_up_area || "-",
        carpet: property.areas[0]?.carpet_up_area || "-",
        remarks: property.description || "-",
        contact_person1: property.contacts[0]?.conatact_person_1 || "-",
        contact_person2: property.contacts[0]?.conatact_person_2 || "-",
        company_builder_name: property.contacts[0]?.company_builder_name || "-",
        conatact_person_number_1:
          property.contacts[0]?.conatact_person_number_1 || "-",
        conatact_person_number_2:
          property.contacts[0]?.conatact_person_number_2 || "-",
        builderaddress: property.contacts[0]?.address || "-",
        email: property.contacts[0]?.email || "-",
        reffered_by: property.contacts[0]?.reffered_by || "-",
        contact_person_address: property.contacts[0]?.address || "-",
      }));
      console.log(transformedProperties);
      setProperties(transformedProperties);
      setFilteredPropertiesSidebar(transformedProperties);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(err.message || "Failed to fetch properties");
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    return properties.filter((property) => {
      const rateBuyNumeric =
        typeof property.rate_buy === "string" && property.rate_buy !== "-"
          ? parseFloat(property.rate_buy.replace(/[^0-9.-]+/g, ""))
          : property.rate_buy;

      const matchesSearch = Object.values(property).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDropdownPropertyType =
        !selectedPropertyType ||
        property.property_type === selectedPropertyType;

      const matchesLLOutright =
        !selectedLLOutright || property.outright === selectedLLOutright;

      const matchesFunUnfurn = !funUnfurn || property.description === funUnfurn;

      const matchesSidebarPropertyType =
        !filters.propertyType ||
        property.property_type === filters.propertyType;

      const matchesCity = !filters.city || property.city_name === filters.city;

      const matchesPrice =
        filters.anyPrice ||
        (typeof rateBuyNumeric === "number" &&
          rateBuyNumeric >= filters.priceRange[0] &&
          rateBuyNumeric <= filters.priceRange[1]);

      const matchesAreaSize =
        !filters.areaSize ||
        (property.carpet >= filters.areaSize[0] &&
          property.carpet <= filters.areaSize[1]);

      return (
        matchesSearch &&
        matchesDropdownPropertyType &&
        matchesSidebarPropertyType &&
        matchesCity &&
        matchesPrice &&
        matchesAreaSize &&
        matchesFunUnfurn &&
        matchesLLOutright
      );
    });
  };

  // filter data on basis of Carpet Area
  const handleCarpetSizeChange = (index, value) => {
    const updatedSize = [...squareSize];
    updatedSize[index] = value; // Ensure it's a number
    setSquareSize(updatedSize);

    setFilters((prev) => ({
      ...prev,
      areaSize: updatedSize,
    }));
  };

  const showFilter = () => {
    setFilter(!filter);
  };
  useEffect(() => {
    if (to) {
      applyFilter();
    }
  }, [to]);

  useEffect(() => {
    // console.log("Filters updated:", filters);
  }, [filters]);

  // Handler for filter updates from sidebar
  const handleFilterUpdate = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));

    // Reset dropdown property type if sidebar property type is set
    if (newFilters.propertyType) {
      setSelectedPropertyType("");
    }

    // Trigger re-filtering
    setShouldRefreshFilters(true);
  };

  const handlePropertyTypeChange = (e) => {
    const newValue = e.target.value;
    setSelectedPropertyType(newValue);

    // Reset sidebar property type filter
    setFilters((prev) => ({ ...prev, propertyType: "" }));

    // Trigger re-filtering
    setShouldRefreshFilters(true);
  };
  // console.log(handleFilterUpdate);

  const filteredProperties = getFilteredProperties();

  const showContactDetails = (property) => {
    const efficiency =
      property.efficiency || property.areas?.[0]?.efficiency || "-";
    const rate_buy =
      property.rate_buy || property.areas?.[0]?.outright_rate_psf || "-";
    const rate_lease =
      property.rate_lease || property.areas?.[0]?.rental_psf || "-";
    const floor =
      property.floor || property.areas?.[0]?.floor_wing_unit_number || "-";
    const car_parking =
      property.car_parking || property.areas?.[0]?.car_parking || "-";
    const builtup =
      property.builtup || property.areas?.[0]?.built_up_area || "-";
    const carpet =
      property.carpet || property.areas?.[0]?.carpet_up_area || "-";
    const reopen = property.reopen || property.reopen_data || "-";

    Swal.fire({
      title: `<h2 style="color: #2c3e50; font-weight: 700; margin-bottom: 10px;">Property Details</h2>`,
      html: `
        <div style="text-align: left; font-size: 16px; color: #2c3e50; line-height: 1.6;">
          <p><strong>Efficiency:</strong> ${efficiency}%</p>
          <p><strong>Buy Rate:</strong> ${rate_buy}</p>
          <p><strong>Lease Rate:</strong> ${rate_lease}</p>
  
          <div style="margin-top: 10px; padding: 4px;  border-radius: 6px;">
            <strong style="font-size: 17px;">Floor Details:</strong>
            <table style="width: 50; border-collapse: collapse; margin-top: 5px; font-size: 10px; table-layout: unset;">
              <tr style="background: #dcdcdc; font-weight: bold;">
                <th style="padding: 3px; border: 1px solid #ccc;">Floor</th>
                <th style="padding: 3px; border: 1px solid #ccc;">Unit No.</th>
                <th style="padding: 3px; border: 1px solid #ccc;">Wing</th>
              </tr>
              ${
                Array.isArray(floor)
                  ? floor
                      .map(
                        (ele) => `
                  <tr>
                    <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${
                      ele.floor || "-"
                    }</td>
                    <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${
                      ele.unit_number || "-"
                    }</td>
                    <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${
                      ele.wing || "-"
                    }</td>
                  </tr>
                `
                      )
                      .join("")
                  : `
                <tr>
                  <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${floor}</td>
                  <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">-</td>
                  <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">-</td>
                </tr>
              `
              }
            </table>
          </div>
  
          <p><strong>Car Parking:</strong> ${car_parking}</p>
          <p><strong>Builtup Area:</strong> ${builtup} sqft</p>
          <p><strong>Carpet Area:</strong> ${carpet} sqft</p>
          <p><strong>Reopen Date:</strong> ${reopen}</p>
          
          <hr style="border-top: 1px solid #dcdcdc; margin: 10px 0;"/>
        </div>`,
      confirmButtonText: "Close",
      width: "480px",
      background: "#ffffff",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <UserSidebar
        properties={properties}
        onFilterChange={handleFilterUpdate}
        currentFilters={filters}
      />

      <div className="w-[100%] overflow-y-scroll">
        <div className="pb-20 pl-20 mx-2 my-24 ">
          <div className="flex gap-8 -mt-14 mb-7">
            <button className="text-xl text-gray-400 border-blue-900 hover:text-blue-900 hover:border-b-2">
              Properties
            </button>
            <button className="text-xl text-gray-400 hover:text-blue-900 hover:border-blue-900 hover:border-b-2 ">
              Clients
            </button>
          </div>
          <div className="flex justify-between h-10 ">
            <div className="w-[100%] flex gap-2">
              <select
                className="border border-gray-300 rounded p-1 w-[50%]"
                value={selectedPropertyType}
                onChange={handlePropertyTypeChange}
              >
                <option value="">All Property Types</option>
                {[...new Set(properties.map((p) => p.property_type))].map(
                  (type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  )
                )}
              </select>
              <label className=" border border-gray-300 text-gray-400 rounded p-2 ml-6 w-[50%]">
                <option>Location</option>
              </label>
              <div className="relative w-full cursor-pointer right-[44px] top-[2px]">
                <div onClick={showFilter}>
                  <img
                    src="./LeftColumn/Filter.png"
                    alt=""
                    className="h-[35px]"
                  />
                </div>
                {filter && (
                  <div className="absolute z-20 p-4 bg-white border border-gray-300 rounded-md shadow-xl right-[95%] top-[140%]">
                    <h1 className="mb-3 text-lg font-semibold">
                      Locality range
                    </h1>
                    <div className="flex items-center gap-2 mb-3">
                      <select
                        onChange={(e) => setFrom(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option>From</option>
                        {FilterArea.map((area) => (
                          <option key={area.property_code}>
                            {area.area_name}
                          </option>
                        ))}
                      </select>
                      <button className="p-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700">
                        →
                      </button>
                      <select
                        onChange={(e) => setTo(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option>To</option>
                        {FilterArea.map((area) => (
                          <option key={area.property_code}>
                            {area.area_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={isEast}
                          onChange={() => setIsEast(!isEast)}
                          className="w-4 h-4 border border-gray-300 rounded focus:ring-blue-500"
                        />
                        East
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={isWest}
                          onChange={() => setIsWest(!isWest)}
                          className="w-4 h-4 border border-gray-300 rounded focus:ring-blue-500"
                        />
                        West
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-[50%] mt-4">
                        <h2 className="text-gray-600">Area Range</h2>
                        <div className="flex gap-2 mt-2 mb-3">
                          <input
                            type="number"
                            placeholder="Min"
                            min={MIN_SQFT}
                            max={MAX_SQFT}
                            value={squareSize[0]}
                            onChange={(e) =>
                              handleCarpetSizeChange(0, e.target.value)
                            }
                            className="w-1/2 p-2 border rounded"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            min={MIN_SQFT}
                            max={MAX_SQFT}
                            value={squareSize[1]}
                            onChange={(e) =>
                              handleCarpetSizeChange(1, e.target.value)
                            }
                            className="w-1/2 p-2 border rounded"
                          />
                          <span className=" flex items-center text-gray-500 w-[20%] ">
                            sq ft
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col w-[50%] mt-4">
                        <label htmlFor="propertyType" className="text-gray-600">
                          Property Type
                        </label>
                        <select
                          id="propertyType"
                          className="p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={selectedPropertyType}
                          onChange={handlePropertyTypeChange}
                        >
                          <option value="">All Property Types</option>
                          {[
                            ...new Set(properties.map((p) => p.property_type)),
                          ].map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col w-[50%] mt-4">
                        <label htmlFor="funUnfurn" className="text-gray-600">
                          Fun/Unfurn
                        </label>
                        <select
                          id="funUnfurn"
                          value={funUnfurn}
                          onChange={(e) => setFunUnfurn(e.target.value)}
                          className="p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select an option</option>
                          {propertyTypes.map((desc) => (
                            <option key={desc.des_id}>
                              {desc.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col w-[50%] mt-4">
                        <label htmlFor="llOutright" className="text-gray-600">
                          LL/Outright
                        </label>
                        <select
                          id="llOutright"
                          className="p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={selectedLLOutright}
                          onChange={(e) =>
                            setSelectedLLOutright(e.target.value)
                          }
                        >
                          <option value="">Select an option</option>
                          {[...new Set(properties.map((p) => p.outright))].map(
                            (type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-10 mt-8 mb-6">
                      <button
                        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                        onClick={showFilter}
                      >
                        Cancel
                      </button>
                      {/* <button
                        className="px-4 py-2 text-white transition-colors bg-blue-800 rounded-md hover:bg-blue-900"
                        onClick={applyFilter}
                      >
                        Apply filters
                      </button> */}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <button
                type="button"
                className="px-10 py-2 text-xl text-white bg-blue-900 rounded-md hover:bg-blue-800"
                onClick={() => setShowPropertyForm(true)}
              >
                Add
              </button>
            </div>
          </div>

          {showPropertyForm ? (
            <PropertyForm
              setShowPropertyForm={setShowPropertyForm}
              onSubmit={fetchProperties}
            />
          ) : (
            <div className="w-full overflow-x-auto">
              {loading ? (
                <div className="mt-8 text-center">Loading properties...</div>
              ) : filteredProperties.length === 0 && !showfilterdata ? (
                <div className="mt-8 text-center">No properties found</div>
              ) : (
                <table className="w-full mt-12 border border-collapse border-gray-300 min-w-max">
                  <thead>
                    <tr className="h-12 text-white bg-blue-800">
                      <th className="px-4 border">Building Name</th>
                      <th className="px-4 border">City</th>
                      <th className="px-4 border">East/West</th>
                      <th className="px-4 border">Address</th>
                      <th className="px-4 border">Location</th>
                      <th className="px-4 border">Sublocation</th>
                      <th className="px-4 border">Description</th>
                      <th className="px-4 border">LL/Outright</th>
                      <th className="px-4 border">Property Type</th>
                      <th className="px-4 border">Status</th>
                      <th className="px-4 border">Builder Name</th>
                      <th className="px-4 border">Address</th>
                      <th className="px-4 border">Person 1</th>
                      <th className="px-4 border">Person1 Contact</th>
                      <th className="px-4 border">Person2 </th>
                      <th className="px-4 border">Person2 Contact</th>
                      <th className="px-4 border text-wrap">Email</th>
                      <th className="px-4 border text-wrap">Reffered By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.length === 0 ? (
                      <tr>
                        <td colSpan="18" className="py-4 text-center">
                          <h3>No properties found</h3>
                        </td>
                      </tr>
                    ) : (
                      filteredProperties.map((property, index) => (
                        <tr
                          key={index}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => showContactDetails(property)}
                        >
                          <td className="px-4 py-2 border text-wrap">
                            {property.building}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.city_name}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.east_west}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.address}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.areas_name}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.area_name}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.description}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.outright}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.property_type}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.poss_status}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.company_builder_name}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.builderaddress}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.contact_person1}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.conatact_person_number_1}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.contact_person2}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.conatact_person_number_2}
                          </td>
                          <td className="px-4 py-2 break-all border text-wrap">
                            {property.email}
                          </td>
                          <td className="px-4 py-2 border text-wrap">
                            {property.reffered_by}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
