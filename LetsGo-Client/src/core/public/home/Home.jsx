import { useState } from "react";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import Search from "../search/Search";
import HeroSection from "./HeroSection";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const Home = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const featuredRoutes = [
    {
      title: "Discover Rara Lake",
      message: "Escape to the serene beauty of Rara Lake — Nepal's hidden paradise. Breathe in the crisp mountain air and let nature soothe your soul.",
      image: "/popular/pokhara.jpg",
    },
    {
      title: "Kathmandu Adventure",
      message: "Embark on a breathtaking journey to the vibrant capital city — where ancient heritage meets modern life.",
      image: "/popular/Pashupatinath_Temple-2020.jpg",
    },
    {
      title: "Janakpur",
      message: "Step into the city of temples and culture — explore the sacred land of Goddess Sita and its rich traditions.",
      image: "/neww/janakpur.jpeg",
    },
    {
      title: "Everest Base Camp",
      message: "Stand in the shadow of the world's highest peak — an adventure of a lifetime awaits at Everest Base Camp.",
      image: "/popular/title.jpg",
    },
    {
      title: "Pashupatinath Temple",
      message: "Find inner peace by the banks of the Bagmati River — witness centuries-old rituals and divine serenity.",
      image: "/popular/Pashupatinath_Temple-2020.jpg",
    },
    {
      title: "Pokhara Getaway",
      message: "Sail across Phewa Lake, hike the Annapurna trails, and soak in the majestic Himalayan views — Pokhara has it all.",
      image: "/popular/pokhara.jpg",
    },
    {
      title: "Chitwan National Park",
      message: "Dive into the wild heart of Nepal — go on a jungle safari and spot rhinos, tigers, and exotic birds in Chitwan.",
      image: "/popular/title.jpg",
    },
  ];

  const openImage = (index) => {
    setSelectedIndex(index);
  };

  const closeImage = () => {
    setSelectedIndex(null);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % featuredRoutes.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + featuredRoutes.length) % featuredRoutes.length);
  };

  return (
    <>
      <div className="min-h-screen mx-auto max-w-[1300px] mt-2">
        <Navbar />
        <HeroSection />

        {/* Featured Routes Section */}
        <section className="my-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-green-700">Explore Routes</h2>

          <div className="flex overflow-x-auto space-x-6 p-4">
            {featuredRoutes.map((route, index) => (
              <div
                key={index}
                className="min-w-[300px] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                onClick={() => openImage(index)}
              >
                <img
                  src={route.image}
                  alt={route.title}
                  className="w-full h-[300px] object-cover group-hover:brightness-75 transition-all duration-300"
                />
                <div className="p-4 bg-white">
                  <h3 className="text-xl font-bold group-hover:text-green-600 transition-colors duration-300">
                    {route.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">{route.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fullscreen Image Slider */}
        {selectedIndex !== null && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={closeImage}
          >
            <div className="relative max-w-4xl w-full p-4">
              <img
                src={featuredRoutes[selectedIndex].image}
                alt={featuredRoutes[selectedIndex].title}
                className="w-full h-auto rounded-lg transform hover:scale-105 transition-transform duration-300"
              />
              <h3 className="text-white text-center text-2xl mt-4">
                {featuredRoutes[selectedIndex].title}
              </h3>
              <p className="text-gray-300 text-center mt-2">
                {featuredRoutes[selectedIndex].message}
              </p>

              {/* Navigation Arrows */}
              <button
                className="absolute top-1/2 left-4 bg-white text-black p-2 rounded-full hover:bg-gray-200 hover:scale-110 transition-all duration-300"
                onClick={prevImage}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="absolute top-1/2 right-4 bg-white text-black p-2 rounded-full hover:bg-gray-200 hover:scale-110 transition-all duration-300"
                onClick={nextImage}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Close Button */}
              <button
                className="absolute top-4 right-4 bg-white text-black p-2 rounded-full hover:bg-gray-200 hover:rotate-90 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  closeImage();
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div id="search-section">
          <Search />
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Home;
