import { useState, useEffect } from "react";
import PropertyForm from "../../components/PropertyForm";
import axios from "../../helper/axios";
import Swal from "sweetalert2";
import UserSidebar from "./UserSidebar.jsx";
import SearchFilter from "../../components/SearchFilter";

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
  const [propertyTypeShow, setPropertyTypeShow] = useState(false);
  const [filterpropertyInput, setFilterPropertyInput] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [filters, setFilters] = useState({
    propertyType: "",
    city: "",
    priceRange: [1000, 1000000],
    anyPrice: true,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const showFilter = () => {
    setFilter(!filter);
  };

  const fetchProperties = async () => {
    try {
      const response = await axios.get("/api/get_all_properties/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);

      if (!response.data) throw new Error("No data received");

      // Transform the API response to match the expected structure
      const transformedProperties = response.data.map((property) => ({
        // project_name: property.building_name || "-",
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
        pin_code: "-", // Not provided in the API
        east_west: property.east_west || "-",
        reopen: property.reopen_data || "-",
        floor: property.areas[0]?.floor_wing_unit_number || "-",
        // wing: property.areas[0]?.floor_wing_unit_number?.wing || "-",
        // unit_no: property.areas[0]?.floor_wing_unit_number?.unit_number || "-",
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

      const rateBuyNumeric = parseFloat(property.rate_buy.replace(/[^0-9.-]+/g, ""));
      // Apply search term filter
      const matchesSearch = Object.values(property).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply dropdown property type filter
      const matchesDropdownPropertyType =
        !selectedPropertyType ||
        property.property_type === selectedPropertyType;

      // Apply sidebar filters
      const matchesSidebarPropertyType =
        !filters.propertyType ||
        property.property_type === filters.propertyType;

      const matchesCity = !filters.city || property.city_name === filters.city;

      const matchesPrice =
      filters.anyPrice ||
      (rateBuyNumeric >= filters.priceRange[0] &&
        rateBuyNumeric <= filters.priceRange[1]);

      // All filters must match
      return (
        matchesSearch &&
        matchesDropdownPropertyType &&
        matchesSidebarPropertyType &&
        matchesCity &&
        matchesPrice
      );
    });
  };

  useEffect(() => {
    console.log("Filters updated:", filters);
  }, [filters]);

  // Handler for filter updates from sidebar
  const handleFilterUpdate = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset the dropdown selection when sidebar filters change
    setSelectedPropertyType("");
  };

  // Handler for dropdown property type selection
  const handlePropertyTypeChange = (e) => {
    const newValue = e.target.value;
    setSelectedPropertyType(newValue);
    // Reset the sidebar property type filter when dropdown changes
    setFilters((prev) => ({ ...prev, propertyType: "" }));
  };

  const filteredProperties = getFilteredProperties();

  const showContactDetails = (property) => {
    Swal.fire({
      title: `<h2 style="color: #2c3e50; font-weight: 700; margin-bottom: 10px;">Property Details</h2>`,
      html: `
        <div style="text-align: left; font-size: 16px; color: #2c3e50; line-height: 1.6;">
          <p><strong>Location:</strong> ${property.areas_name}</p>
          <p><strong>Efficiency:</strong> ${property.efficiency}%</p>
          <p><strong>Buy Rate:</strong> ${property.rate_buy}</p>
          <p><strong>Lease Rate:</strong> ${property.rate_lease}</p>
  
          <div style="margin-top: 10px; padding: 4px;  border-radius: 6px;">
            <strong style="font-size: 17px;">Floor Details:</strong>
            <table style="width: 50; border-collapse: collapse; margin-top: 5px; font-size: 10px; table-layout: unset;">
              <tr style="background: #dcdcdc; font-weight: bold;">
                <th style="padding: 3px; border: 1px solid #ccc;">Floor</th>
                <th style="padding: 3px; border: 1px solid #ccc;">Unit No.</th>
                <th style="padding: 3px; border: 1px solid #ccc;">Wing</th>
              </tr>
              ${property.floor
                .map(
                  (ele) => `
                  <tr>
                    <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${ele.floor}</td>
                    <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${ele.unit_number}</td>
                    <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${ele.wing}</td>
                  </tr>
                `
                )
                .join("")}
            </table>
          </div>
  
          <p><strong>Car Parking:</strong> ${property.car_parking}</p>
          <p><strong>Builtup Area:</strong> ${property.builtup} sqft</p>
          <p><strong>Carpet Area:</strong> ${property.carpet} sqft</p>
          <p><strong>Reopen Date:</strong> ${property.reopen}</p>
          
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
        setFilteredPropertiesSidebar={setFilteredPropertiesSidebar}
        onFilterChange={handleFilterUpdate}
        currentFilters={filters}
      />

      <div className="w-[100%] overflow-y-scroll">
        <div className="pb-20 pl-20 mx-2 my-24 ">
          <div className="flex justify-between h-10 ">
            <div className="w-[100%] flex gap-2">
              <select
                className="border border-gray-300 rounded p-1 w-[50%]"
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
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
              <div className="relative top-0 w-full cursor-pointer right-[49px]">
                <div onClick={showFilter}>
                  <img
                    src="./LeftColumn/Filter.png"
                    alt=""
                    className="h-[40px]"
                  />
                </div>
                {filter && (
                  <SearchFilter
                    propertyTypeShow={propertyTypeShow}
                    setPropertyTypeShow={setPropertyTypeShow}
                    filterpropertyInput={filterpropertyInput}
                    setFilterPropertyInput={setFilterPropertyInput}
                  />
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
              ) : filteredProperties.length === 0 ? (
                <div className="mt-8 text-center">No properties found</div>
              ) : (
                <table className="w-full mt-12 border border-collapse border-gray-300 min-w-max">
                  <thead>
                    <tr className="h-12 text-white bg-blue-800">
                      <th className="px-4 border">Building Name</th>
                      <th className="px-4 border">City</th>
                      <th className="px-4 border">East/West</th>
                      <th className="px-4 border">Address</th>
                      {/* <th className="px-4 border">Location</th> */}
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
                    {filteredProperties.map((property, index) => (
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

                        {/* <td className="px-4 py-2 border text-wrap">
                          {property.location}
                        </td> */}
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
                    ))}
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
