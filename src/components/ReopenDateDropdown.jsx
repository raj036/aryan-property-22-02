import React, { useState , useRef , useEffect} from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

const PropertyStatusDropdown = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selection, setSelection] = useState({
    status: '',
    date: null,
    displayValue: ''
  });

  const dropdownRef = useRef(null);

   useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

  // Format and send data to backend as string
  const logFinalSelection = (status, date = null) => {
    let finalValue;
    
    if (date && (status === 'Leased Out' || status === 'Reopen Date')) {
      // Format as single string
      finalValue = `${status} ${format(date, 'dd/MM/yyyy')}`;
    } else {
      // For statuses without dates
      finalValue = status;
    }
    
    console.log("FINAL USER SELECTION:", finalValue);
    if (onChange) {
      onChange(finalValue);
    }
  };

  const handleStatusSelect = (status) => {
    if (status === 'Leased Out' || status === 'Reopen Date') {
      setSelection({
        ...selection,
        status,
        displayValue: `${status} (Select Date)`
      });
      setShowCalendar(true);
    } else {
      const newSelection = {
        status,
        date: null,
        displayValue: status
      };
      setSelection(newSelection);
      logFinalSelection(status);
      setShowCalendar(false);
    }
    setIsOpen(false);
  };

  const handleDateSelect = (date) => {
    const formattedDate = format(date, 'dd/MM/yyyy');
    const newSelection = {
      ...selection,
      date: date,
      displayValue: `${selection.status} (${formattedDate})`
    };
    
    setSelection(newSelection);
    logFinalSelection(selection.status, date);
    setShowCalendar(false);
  };

  const SimpleCalendar = () => {
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Add empty cells for days before the first day of the month
    const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    const allCells = [...emptyCells, ...days];

    return (
      <div className="absolute z-10 p-4 mt-1 bg-white border rounded-md shadow-lg">
        <div className="mb-2 font-bold">{format(currentDate, 'MMMM yyyy')}</div>
        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs font-semibold text-center">{day}</div>
          ))}
          {allCells.map((day, index) => (
            <div key={index} className="flex items-center justify-center w-8 h-8">
              {day && (
                <button
                  className="flex items-center justify-center w-8 h-8 text-sm rounded-full hover:bg-blue-100"
                  onClick={() => {
                    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    handleDateSelect(selected);
                  }}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          className="w-full px-3 py-1 mt-2 text-sm text-white bg-blue-500 rounded"
          onClick={() => setShowCalendar(false)}
        >
          Cancel
        </button>
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <h2 className="mb-2 text-sm font-semibold">Reopen Date</h2>

      <div className="relative">
        <div
          className="h-10 rounded-lg border border-[#D3DAEE] p-3 flex justify-between items-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selection.displayValue || "Select Status"}</span>
          <img
            className={`object-none absolute right-[8px] ${isOpen ? "rotate-180" : ""}`}
            src="./LeftColumn/Closed.png"
            alt=""
          />
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 z-10 mt-1 bg-white border rounded shadow-lg">
            <div className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleStatusSelect('Available')}>
              Available
            </div>
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleStatusSelect('Leased Out')}>
              <span>Leased Out (dd/mm/yyyy)</span>
              <Calendar size={16} />
            </div>
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleStatusSelect('Reopen Date')}>
              <span>Reopen Date (dd/mm/yyyy)</span>
              <Calendar size={16} />
            </div>
            <div className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleStatusSelect('Sold out')}>
              Sold out
            </div>
          </div>
        )}

        {showCalendar && !isOpen && <SimpleCalendar />}
      </div>
    </div>
  );
};

export default PropertyStatusDropdown;