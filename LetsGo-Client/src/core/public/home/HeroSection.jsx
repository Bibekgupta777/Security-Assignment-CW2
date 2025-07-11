import React from "react";
import { LuTicket } from "react-icons/lu";
import { TbBusStop, TbUsersGroup } from "react-icons/tb";
import BG from "/Images/Rectangle3.png";

const HeroSection = () => {
  const cardData = [
    {
      number: "500K+",
      label: "Register users",
      icon: <TbUsersGroup className="md:text-5xl text-2xl text-green-400" />,
    },
    {
      number: "1.7 Lacks",
      label: "Ticket sold",
      icon: <LuTicket className="md:text-5xl text-2xl text-green-400" />,
    },
    {
      number: "30K+",
      label: "Rental partner",
      icon: <TbBusStop className="md:text-5xl text-2xl text-green-400" />,
    },
  ];

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="md:px-8 px-6 pt-8 flex items-center">
        <div className="w-full lg:px-16">
          <img src={BG} alt="bus bg" className="w-full rounded-3xl" />
        </div>
      </div>

      {/* Card Container */}
      <div className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 w-11/12 md:w-8/12 flex justify-center space-x-6 z-10">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="bg-white md:rounded-3xl rounded-2xl flex md:flex-row flex-col items-center justify-center md:px-8 px-2 py-1 md:py-8 border-b-4 border-green-400 w-20 sm:w-72 md:w-96 shadow-xl"
          >
            {/* Icon dynamically rendered from the card data with the same color */}
            {card.icon}
            <div className="md:ml-4">
              <h1 className="font-semibold md:text-3xl text-sm text-gray-800">
                {card.number}
              </h1>
              <h1 className="text-gray-500 md:text-base text-[9px]">{card.label}</h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;