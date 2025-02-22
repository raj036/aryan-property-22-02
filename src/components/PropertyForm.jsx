import { useEffect, useState } from "react";
import PropertyTypeDropdown from "./PropertyTypeDropdown";
import ReopenDateDropdown from "./ReopenDateDropdown";
import { MdCancel } from "react-icons/md";
import axios from "../helper/axios";
import Swal from "sweetalert2";
import DescriptionTypeDropdown from "./DescriptionTypeDropdown";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";

const PropertyForm = ({ setShowPropertyForm }) => {
  const tabs = ["AddProperty", "AreaDetails", "Contact"];
  const [activeTab, setActiveTab] = useState(0);
  const token = localStorage.getItem("token");
  const [FilterAreaData, setFilterAreaData] = useState([]);
  const [filterAreaId, setfilterAreaId] = useState(0);

  const [formData, setFormData] = useState({
    building_name: "",
    full_address: "",
    sublocation: "",
    city: "",
    des_code: "",
    LL_outright: "",
    property_type: "",
    poss_status: "",
    east_west: "",
    reopen_date: "",
    areas: [
      {
        filter_area_id: null,
        built_up_area: null,
        carpet_up_area: null,
        efficiency: null,
        car_parking: "",
        rental_psf: "",
        outright_rate_psf: "",
        unit_floor_wing: [
          {
            wing: "",
            floor: "",
            unit_number: "",
          },
        ],
        contacts: [
          {
            company_builder_name: "",
            address: "",
            conatact_person_1: "",
            conatact_person_2: "",
            conatact_person_number_1: null,
            conatact_person_number_2: null,
            email: "",
            reffered_by: "",
          },
        ],
      },
    ],
  });

  const FilterArea = async () => {
    try {
      const response = await axios.get("/api/filter_area/");
      setFilterAreaData(response.data);
    } catch (error) {
      console.error("Error fetching filter areas:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch locations",
      });
    }
  };

  useEffect(() => {
    FilterArea();
  }, []);

  const handlefilterAreaId = (location) => {
    const locationId = parseInt(location);
    setfilterAreaId(locationId);

    setFormData((prev) => ({
      ...prev,
      areas: [
        {
          ...prev.areas[0],
          filter_area_id: locationId,
        },
      ],
    }));
  };

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;

    // Fields that should be converted to numbers
    const numericFields = [
      "built_up_area",
      "carpet_up_area",
      "efficiency",

      "conatact_person_number_1",
      "conatact_person_number_2",
    ];

    const processedValue = numericFields.includes(name) ? Number(value) : value;

    if (section === "property") {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    } else if (section === "propertyDetails") {
      setFormData((prev) => ({
        ...prev,
        areas: [
          {
            ...prev.areas[0],
            [name]: processedValue,
          },
        ],
      }));
    } else if (section === "contact") {
      setFormData((prev) => ({
        ...prev,
        areas: [
          {
            ...prev.areas[0],
            contacts: [
              {
                ...prev.areas[0].contacts[0],
                [name]: processedValue,
              },
            ],
          },
        ],
      }));
    }
  };

  const handleEastWestChange = (direction) => {
    setFormData((prev) => ({
      ...prev,
      east_west: direction,
    }));
  };

  const validateForm = () => {
    // Required fields validation
    const requiredFields = {
      building_name: "Building Name",
      full_address: "Full Address",
      sublocation: "Sub Location",
      city: "City",
      property_type: "Property Type",
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: `${label} is required`,
        });
        return false;
      }
    }

    // Numeric fields validation
    const requiredNumberFields = {
      built_up_area: formData.areas[0].built_up_area,
      carpet_up_area: formData.areas[0].carpet_up_area,
      efficiency: formData.areas[0].efficiency,
      filter_area_id: formData.areas[0].filter_area_id,
    };

    for (const [field, value] of Object.entries(requiredNumberFields)) {
      if (typeof value !== "number" || isNaN(value)) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: `${field.replace(/_/g, " ")} must be a valid number`,
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await axios.post(
        "/api/add_property_with_hierarchy/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log(response);
      // console.log(formData);

      if (response?.data) {
        await Swal.fire({
          icon: "success",
          title: "Property data added successfully",
          text: "Redirecting...",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        window.location.reload();
        setShowPropertyForm(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "Property not added",
        text:
          error.response?.data?.detail ||
          "An error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="relative max-h-screen p-8 mt-1 rounded-lg shadow-md ">
      <button
        onClick={() => setShowPropertyForm(false)}
        className="absolute top-5 right-2"
      >
        <MdCancel className="text-xl text-gray-500 hover:text-red-600" />
      </button>

      <div className="flex border-b pb-7">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`flex-1 py-3 font-semibold rounded-md ${
              index !== tabs.length - 1 ? "border-r-2" : ""
            } ${
              activeTab === index
                ? "text-white bg-blue-900"
                : "hover:text-blue-700"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.replace(/([A-Z])/g, " $1").trim()}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <form className="grid h-full grid-cols-3 gap-10 mx-auto mt-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Building Name</label>
            <input
              type="text"
              name="building_name"
              className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
              onChange={(e) => handleInputChange(e, "property")}
              value={formData.building_name}
            />
            <label className="block text-sm font-semibold">Sub Location</label>
            <input
              type="text"
              name="sublocation"
              className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
              onChange={(e) => handleInputChange(e, "property")}
              value={formData.sublocation}
            />

            <label className="block text-sm font-semibold">City</label>
            <input
              type="text"
              name="city"
              className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
              onChange={(e) => handleInputChange(e, "property")}
              value={formData.city}
            />

            <label className="block text-sm font-semibold">LL / Outright</label>
            <input
              type="text"
              name="LL_outright"
              className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
              onChange={(e) => handleInputChange(e, "property")}
              value={formData.LL_outright}
            />

            <label className="block text-sm font-semibold">Poss. Status</label>
            <input
              type="text"
              name="poss_status"
              className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
              onChange={(e) => handleInputChange(e, "property")}
              value={formData.poss_status}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">Full Address</label>
            <input
              type="text"
              name="full_address"
              className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
              onChange={(e) => handleInputChange(e, "property")}
              value={formData.full_address}
            />

            <label className="block text-sm font-semibold">Location</label>
            <select
              name="location"
              className="h-10 w-full p-1 border border-[#D3DAEE] rounded-lg shadow-sm"
              onChange={(e) => handlefilterAreaId(e.target.value)}
              value={filterAreaId}
            >
              <option value="">Select Location</option>
              {FilterAreaData.map((location) => (
                <option
                  key={location.filter_area_id}
                  value={location.filter_area_id}
                >
                  {location.area_name}
                </option>
              ))}
            </select>

            <DescriptionTypeDropdown
              onChange={(value) =>
                handleInputChange(
                  { target: { name: "des_code", value } },
                  "property"
                )
              }
            />

            <PropertyTypeDropdown
              onChange={(value) =>
                handleInputChange(
                  { target: { name: "property_type", value } },
                  "property"
                )
              }
            />

            <ReopenDateDropdown
              onChange={(value) =>
                handleInputChange(
                  { target: { name: "reopen_date", value } },
                  "property"
                )
              }
            />
          </div>

          <div className="flex items-center gap-3 pb-32 text-center">
            <input
              type="checkbox"
              className="accent-blue-800 size-4"
              checked={formData.east_west === "east"}
              onChange={() => handleEastWestChange("east")}
            />
            East
            <input
              type="checkbox"
              className="accent-blue-800 size-4"
              checked={formData.east_west === "west"}
              onChange={() => handleEastWestChange("west")}
            />
            West
          </div>
        </form>
      )}

      {activeTab === 1 && (
        <>
          <form className="grid grid-cols-3 gap-6 mx-auto mt-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                Built up Area
              </label>
              <input
                type="number"
                name="built_up_area"
                className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
                value={formData.areas[0].built_up_area}
                onChange={(e) => handleInputChange(e, "propertyDetails")}
              />

              <label className="block text-sm font-semibold">Efficiency</label>
              <input
                type="number"
                name="efficiency"
                className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
                value={formData.areas[0].efficiency}
                onChange={(e) => handleInputChange(e, "propertyDetails")}
              />

              <label className="block text-sm font-semibold">Rental psf</label>
              <input
                type="number"
                name="rental_psf"
                className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
                value={formData.areas[0].rental_psf}
                onChange={(e) => handleInputChange(e, "propertyDetails")}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold">Carpet Area</label>
              <input
                type="number"
                name="carpet_up_area"
                className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
                value={formData.areas[0].carpet_up_area}
                onChange={(e) => handleInputChange(e, "propertyDetails")}
              />

              <label className="block text-sm font-semibold">Car Parking</label>
              <input
                type="text"
                name="car_parking"
                className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
                value={formData.areas[0].car_parking}
                onChange={(e) => handleInputChange(e, "propertyDetails")}
              />

              <label className="block text-sm font-semibold">
                Outright Rate psf
              </label>
              <input
                type="number"
                name="outright_rate_psf"
                className="h-10 w-full p-3 border border-[#D3DAEE] rounded-lg shadow-sm"
                value={formData.areas[0].outright_rate_psf}
                onChange={(e) => handleInputChange(e, "propertyDetails")}
              />
            </div>
          </form>

          <div className="p-4">
            <div className="flex justify-around w-[50%] mb-2 font-semibold">
              <span>Unit No</span>
              <span>Floor</span>
              <span>Wing</span>
            </div>

            {formData.areas[0].unit_floor_wing.map((unit, index) => (
              <div
                key={index}
                className="flex gap-3"
              >
                <div className="flex space-x-4 w-[65%] mb-2 items-center">
                <input
                  type="text"
                  placeholder="Unit No"
                  className="w-1/3 p-2 border rounded"
                  name="unit_number"
                  value={unit.unit_number}
                  onChange={(e) => {
                    const newUnits = [...formData.areas[0].unit_floor_wing];
                    newUnits[index].unit_number = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      areas: [
                        {
                          ...prev.areas[0],
                          unit_floor_wing: newUnits,
                        },
                      ],
                    }));
                  }}
                />

                <input
                  type="text"
                  placeholder="Floor"
                  className="w-1/3 p-2 border rounded"
                  name="floor"
                  value={unit.floor}
                  onChange={(e) => {
                    const newUnits = [...formData.areas[0].unit_floor_wing];
                    newUnits[index].floor = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      areas: [
                        {
                          ...prev.areas[0],
                          unit_floor_wing: newUnits,
                        },
                      ],
                    }));
                  }}
                />

                <input
                  type="text"
                  placeholder="Wing"
                  className="w-1/3 p-2 border rounded"
                  name="wing"
                  value={unit.wing}
                  onChange={(e) => {
                    const newUnits = [...formData.areas[0].unit_floor_wing];
                    newUnits[index].wing = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      areas: [
                        {
                          ...prev.areas[0],
                          unit_floor_wing: newUnits,
                        },
                      ],
                    }));
                  }}
                />
</div>
                {index > 0 && (
                  <button
                    onClick={() => {
                      const newUnits = formData.areas[0].unit_floor_wing.filter(
                        (_, i) => i !== index
                      );
                      setFormData((prev) => ({
                        ...prev,
                        areas: [
                          {
                            ...prev.areas[0],
                            unit_floor_wing: newUnits,
                          },
                        ],
                      }));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaMinus />
                  </button>
                )}
              </div>
            ))}

            <div className="flex w-[50%] justify-center mt-4">
              <button
                onClick={() => {
                  const newUnits = [
                    ...formData.areas[0].unit_floor_wing,
                    { wing: "", floor: "", unit_number: "" },
                  ];
                  setFormData((prev) => ({
                    ...prev,
                    areas: [
                      {
                        ...prev.areas[0],
                        unit_floor_wing: newUnits,
                      },
                    ],
                  }));
                }}
                className="flex items-center space-x-2 text-blue-500 hover:text-blue-700"
              >
                <FaPlus />
                <span>Add More</span>
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 2 && (
        <div className="mx-auto mt-6">
          <form className="grid grid-cols-3 gap-8 space">
            <div>
              <label className="block text-sm font-semibold">
                Company / Builder
              </label>
              <input
                type="text"
                name="company_builder_name"
                className="h-10 w-full p-3 mt-2 border border-[#D3DAEE] rounded-md"
                value={formData.areas[0].contacts[0].company_builder_name}
                onChange={(e) => handleInputChange(e, "contact")}
              />

              <label className="block mt-6 text-sm font-semibold">
                Contact Person 1 Name
              </label>
              <input
                type="text"
                name="conatact_person_1"
                value={formData.areas[0].contacts[0].conatact_person_1}
                className="h-10 w-full p-3 mt-2 border border-[#D3DAEE] rounded-md"
                onChange={(e) => handleInputChange(e, "contact")}
              />

              <label className="block mt-6 text-sm font-semibold">
                Contact Person 2 Name
              </label>
              <input
                type="text"
                name="conatact_person_2"
                value={formData.areas[0].contacts[0].conatact_person_2}
                className="h-10 w-full p-3 mt-2 border border-[#D3DAEE] rounded-md"
                onChange={(e) => handleInputChange(e, "contact")}
              />

              <label className="block mt-6 text-sm font-semibold">Email</label>
              <input
                type="email"
                name="email"
                className="h-10 w-full p-3 mt-2 border border-[#D3DAEE] rounded-md"
                value={formData.areas[0].contacts[0].email}
                onChange={(e) => handleInputChange(e, "contact")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Address</label>
              <input
                type="text"
                name="address"
                value={formData.areas[0].contacts[0].address}
                className="h-10 w-full p-3 mt-2 border border-[#D3DAEE] rounded-md"
                onChange={(e) => handleInputChange(e, "contact")}
              />

              <label className="block mt-6 text-sm font-semibold">
                Contact Person 1 Mobile Number
              </label>
              <input
                type="number"
                name="conatact_person_number_1"
                className="h-10 w-full p-3 mt-2 border border-[#D3DAEE] rounded-md"
                value={formData.areas[0].contacts[0].conatact_person_number_1}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                  if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
                  handleInputChange(
                    { target: { name: "conatact_person_number_1", value } },
                    "contact"
                  );
                }}
                maxLength={10}
              />

              <label className="block mt-6 text-sm font-semibold">
                Contact Person 2 Mobile Number
              </label>
              <input
                type="number"
                name="conatact_person_number_2"
                className="h-10 w-full p-3 mt-2 border border-[#D3DAEE] rounded-md"
                value={formData.areas[0].contacts[0].conatact_person_number_2}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                  if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
                  handleInputChange(
                    { target: { name: "conatact_person_number_2", value } },
                    "contact"
                  );
                }}
                maxLength={10}
              />

              <label className="block mt-6 text-sm font-semibold">
                Referred By
              </label>
              <input
                type="text"
                name="reffered_by"
                value={formData.areas[0].contacts[0].reffered_by}
                className="h-10 w-full p-3 mt-2 border border-[#D3DAEE] rounded-md"
                onChange={(e) => handleInputChange(e, "contact")}
              />
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-center gap-6 mt-8">
        {activeTab > 0 && (
          <button
            className="px-6 py-3 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
            onClick={() => setActiveTab(activeTab - 1)}
          >
            Previous
          </button>
        )}
        {activeTab < tabs.length - 1 ? (
          <button
            className="px-6 py-3 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
            onClick={() => setActiveTab(activeTab + 1)}
          >
            Save
          </button>
        ) : (
          <button
            className="px-6 py-3 text-white bg-green-700 rounded-lg hover:bg-green-800"
            onClick={handleSubmit}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyForm;
