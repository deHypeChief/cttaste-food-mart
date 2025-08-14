import { useState } from "react";
import { Icon } from "@iconify/react";
import { Input } from "../../components/form";
import Button from "../../components/button";
import Switch from "../../components/switch";

const daysOfWeek = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default function WorkingHours() {
  const [workingHours, setWorkingHours] = useState(
    daysOfWeek.reduce((acc, day) => ({
      ...acc,
      [day]: {
        isOpen: true,
        startTime: "09:00",
        closingTime: "18:00"
      }
    }), {})
  );

  const handleToggleDay = (day, isOpen) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen
      }
    }));
  };

  const handleTimeChange = (day, timeType, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeType]: value
      }
    }));
  };

  const handleSave = () => {
    console.log("Saving working hours:", workingHours);
    // Add your save logic here
  };

  const handleDiscard = () => {
    // Reset to default values or fetch from server
    setWorkingHours(
      daysOfWeek.reduce((acc, day) => ({
        ...acc,
        [day]: {
          isOpen: true,
          startTime: "09:00",
          closingTime: "18:00"
        }
      }), {})
    );
  };

  return (
    <div className="bg-[#fdf6f1] min-h-screen">
      <div className=" mx-auto">
        <h1 className="text-3xl font-semibold mb-8 text-gray-900">Working Hours</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="space-y-6">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 h-20">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{day}</h3>
                </div>
                
                <div className="flex items-center gap-6">
                  {workingHours[day]?.isOpen && (
                    <>
                      {/* Start Time */}
                      <div className="flex items-center gap-2">
                        <Icon icon="majesticons:clock-line" className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500 whitespace-nowrap">Start Time</span>
                        <Input
                          type="time"
                          value={workingHours[day]?.startTime || "09:00"}
                          onChange={(e) => handleTimeChange(day, "startTime", e.target.value)}
                          className="w-32"
                        />
                      </div>
                      
                      {/* Closing Time */}
                      <div className="flex items-center gap-2">
                        <Icon icon="majesticons:clock-line" className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500 whitespace-nowrap">Closing Time</span>
                        <Input
                          type="time"
                          value={workingHours[day]?.closingTime || "18:00"}
                          onChange={(e) => handleTimeChange(day, "closingTime", e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Toggle Switch */}
                  <Switch
                    checked={workingHours[day]?.isOpen || false}
                    onChange={(isOpen) => handleToggleDay(day, isOpen)}
                    size="md"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              variant="primary"
              className="px-8"
            >
              Save
            </Button>
            <Button
              onClick={handleDiscard}
              variant="outlineFade"
              className="px-8"
            >
              Discard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}