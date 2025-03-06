import { useState, useEffect } from "react";
import PropertyForm from "./PropertyForm";
import axios from "../helper/axios";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

const Property = () => {
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProperty, setEditProperty] = useState(false);
  const [property, setProperty] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProperties();
  }, []);

  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/api/update_property/${id}`, updatedProperty, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire("Updated!", "Property updated successfully", "success");
      fetchProperties(); // Refresh the data
      setShowPropertyForm(false);
      setSelectedProperty(null);
    } catch (error) {
      Swal.fire("Error!", "Failed to update property", "error");
    }
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
        furnished_details: property.furnished_details,
        building: property.building_name || "-",
        address: property.full_address || "-",
        city_name: property.city || "-",
        location: property.location || "-",
        property_code: property.property_code || "-",
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
      setLoading(false);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(err.message || "Failed to fetch properties");
      setLoading(false);
    }
  };
  const filteredProperties = properties.filter((property) =>
    Object.values(property).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`/api/delete_property/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            Swal.fire("Deleted!", "Property deleted successfully", "success");
            fetchProperties();
          })
          .catch(() => {
            Swal.fire("Error!", "Failed to delete property", "error");
          });
      }
    });
  };

  const showContactDetails = (property) => {
    Swal.fire({
      title: `<h2 style="color: #2c3e50; font-weight: 700; margin-bottom: 10px;">Property Details</h2>`,
      html: `
        <div style="text-align: left; font-size: 16px; color: #2c3e50; line-height: 1.6; width: auto; max-width: 450px; overflow: hidden;">
          <p><strong>Efficiency:</strong> ${property.efficiency}%</p>
          <p><strong>Buy Rate:</strong> ${property.rate_buy}</p>
          <p><strong>Lease Rate:</strong> ${property.rate_lease}</p>
    
          <div style="margin-top: 10px; padding: 4px; border-radius: 6px; overflow: hidden;">
            <strong style="font-size: 17px;">Floor Details:</strong>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 12px;">
              <tr style="background: #dcdcdc; font-weight: bold;">
                <th style="padding: 3px; border: 1px solid #ccc; width: 33%;">Floor</th>
                <th style="padding: 3px; border: 1px solid #ccc; width: 33%;">Unit No.</th>
                <th style="padding: 3px; border: 1px solid #ccc; width: 33%;">Wing</th>
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
    
          ${
            property.furnished_details
              ? `
          <div class="furnished-details-section">
            
            <div style="width: 100%; text-align: center;  display: flex; justify-content: center; align-items: center; padding: 10px;">
               <button id="seeMoreBtn" style="margin-top: 10px; padding: 6px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              See Furnished Details
            </button>
            </div>
    
            <div id="furnishedDetails" style="display: none; margin-top: 10px;">
              <hr style="border-top: 1px solid #dcdcdc; margin: 10px 0;"/>
              <div class="furnished-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div>
                  <p><strong>Workstations:</strong> ${
                    property.furnished_details.workstations
                  }</p>
                  <p><strong>Cubicle Type:</strong> ${
                    property.furnished_details.workstation_type_cubicle
                      ? "Yes"
                      : "No"
                  }</p>
                  <p><strong>Linear Type:</strong> ${
                    property.furnished_details.workstation_type_linear
                      ? "Yes"
                      : "No"
                  }</p>
                  <p><strong>Both Types:</strong> ${
                    property.furnished_details.workstation_type_both
                      ? "Yes"
                      : "No"
                  }</p>
                  <p><strong>Cabins:</strong> ${
                    property.furnished_details.cabins
                  }</p>
                </div>
                <div>
                  <p><strong>Meeting Rooms:</strong> ${
                    property.furnished_details.meeting_rooms
                  }</p>
                  <p><strong>Conference Rooms:</strong> ${
                    property.furnished_details.conference_rooms
                  }</p>
                  <p><strong>Cafeteria Seats:</strong> ${
                    property.furnished_details.cafeteria_seats
                  }</p>
                  <p><strong>Washrooms:</strong> ${
                    property.furnished_details.washrooms
                  }</p>
                </div>
              </div>
              
              <div className="additional-amenities" style="margin-top: 10px;">
  ${
    property.furnished_details.pantry_area ||
    property.furnished_details.backup_ups_room ||
    property.furnished_details.server_electrical_room ||
    property.furnished_details.reception_waiting_area
      ? `
    <p><strong>Additional Amenities:</strong></p>
    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
      ${
        property.furnished_details.pantry_area
          ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Pantry Area</span>'
          : ""
      }
      ${
        property.furnished_details.backup_ups_room
          ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Backup UPS Room</span>'
          : ""
      }
      ${
        property.furnished_details.server_electrical_room
          ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Server Electrical Room</span>'
          : ""
      }
      ${
        property.furnished_details.reception_waiting_area
          ? '<span style="background-color: #e9ecef; padding: 5px; border-radius: 4px;">Reception & Waiting Area</span>'
          : ""
      }
    </div>
    `
      : ""
  }
</div>
    
              <div style="width: 100%; text-align: center;  display: flex; justify-content: center; align-items: center; padding: 10px;">
    <button id="seeLessBtn" style="padding: 6px 10px; color: white; border: none; border-radius: 4px; cursor: pointer; background-color: #dc3545;">
        Hide Furnished Details
    </button>
</div>
            </div>
          </div>
          `
              : ""
          }
        </div>`,
      confirmButtonText: "Close",
      width: "500px",
      background: "#ffffff",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
      didOpen: () => {
        const seeMoreBtn = document.getElementById("seeMoreBtn");
        const seeLessBtn = document.getElementById("seeLessBtn");
        const furnishedDetails = document.getElementById("furnishedDetails");

        if (seeMoreBtn && seeLessBtn && furnishedDetails) {
          seeMoreBtn.addEventListener("click", () => {
            furnishedDetails.style.display = "block";
            seeMoreBtn.style.display = "none";
          });

          seeLessBtn.addEventListener("click", () => {
            furnishedDetails.style.display = "none";
            seeMoreBtn.style.display = "inline-block";
          });
        }
      },
    });
  };

  return (
    <div className="pb-20 pl-20 mx-10 my-24 ">
      <div className="flex justify-between h-10 ">
        <div className="flex gap-4 items-center border border-gray-300 rounded-md w-[30%] px-4 py-2">
          <img
            className="object-none"
            src="./LeftColumn/search-normal.png"
            alt="search"
          />
          <input
            className="w-full outline-none"
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

      {showPropertyForm || editProperty ? (
        <PropertyForm
          setShowPropertyForm={setShowPropertyForm}
          onSubmit={selectedProperty ? handleUpdate : fetchProperties}
          propertyData={selectedProperty}
          setEditProperty={setEditProperty}
          editProperty={editProperty}
          property={property}
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
                  <th className="px-4 border text-wrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-4 text-center">
                      <h3>No properties are there</h3>
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((property, index) => (
                    <tr
                      key={index}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => showContactDetails(property)}
                    >
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.building}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.city_name}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.east_west}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.address}
                      </td>

                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.areas_name}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.area_name}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.description}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.outright}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.property_type}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.poss_status}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.company_builder_name}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.builderaddress}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.contact_person1}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.conatact_person_number_1}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.contact_person2}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.conatact_person_number_2}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.email}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        {property.reffered_by}
                      </td>
                      <td className="px-4 py-2 break-all border text-wrap">
                        <div className="flex justify-center gap-4">
                          <FaEdit
                            className="text-blue-600 cursor-pointer"
                            onClick={(e) => {
                              // try {
                                e.stopPropagation();
                                setEditProperty(true);
                                setProperty(property);
                                console.log(property, "edit prop")
                            }}
                          />
                          <MdDelete
                            className="text-red-600 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(property?.property_code);
                            }}
                          />
                        </div>
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
  );
};

export default Property;
