
import Navbar from "@/components/Navbar";
import axios from "axios";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const routeData = {
  popular: {
    title: "Popular Routes",
    message: "These routes are highly rated by travelers for their comfort and convenience.",
    image: "/popular/title.jpg",
    images: [
      { src: "/popular/1602412856.sidetrackimagephotohraphy.jpg", text: "Mountains", description: "Breathtaking mountain views, a must-see for nature enthusiasts." },
      { src: "/popular/image_[.jpg", text: "Bhaktapur", description: "Ancient city filled with rich culture, history, and stunning architecture." },
      { src: "/popular/lumbini-of-nepal.png", text: "Lumbini", description: "The birthplace of Lord Buddha, a significant pilgrimage site." },
      { src: "/popular/Pashupatinath_Temple-2020.jpg", text: "Pashupatinath", description: "A sacred Hindu temple dedicated to Lord Shiva, situated on the Bagmati River." },
      { src: "/popular/pokhara.jpg", text: "Pokhara", description: "A city of lakes and caves, the gateway to the Annapurna Circuit." },
      { src: "/popular/Swayambhunath.jpg", text: "Swayambhunath", description: "The Monkey Temple, a symbol of peace and harmony." },
    ],
  },
  new: {
    title: "New Routes",
    message: "Explore our latest routes with great deals and exciting destinations.",
    image: "/neww/butwal.jpg",
    images: [
      { src: "/neww/dharan.png", text: "Birgunj-Dharan", description: "A bustling city route connecting Birgunj to Dharan." },
      { src: "/neww/janakpur.jpeg", text: "Kathmandu-Janakpur", description: "Explore the vibrant city of Janakpur from Kathmandu." },
      { src: "/neww/Kathmandu-Bandipur.jpg", text: "Kathmandu-Bandipur", description: "Scenic route passing through lush hills and villages." },
      { src: "/neww/Kathmandu-to-Ilam.jpg", text: "Birgunj-Ilam", description: "Journey through the tea gardens of Ilam." },
      { src: "/neww/Pathibhara-Devi-Temple.jpeg", text: "Kathmandu-Pathibhara temple", description: "A spiritual journey to Pathibhara temple." },
      { src: "/neww/butwal.jpg", text: "Pokhara-Butwal", description: "Connects the lakeside city of Pokhara to Butwal." },
    ],
  },
  weekend: {
    title: "Weekend Routes",
    message: "Perfect for a short getaway—relax and enjoy a stress-free ride.",
    image: "/Logo/manaslu.jpg",
    images: [
      { src: "/Logo/annapurna-circuit-trek.jpg", text: "Annupurna Trek", description: "Explore the Annapurna mountain range." },
      { src: "/Logo/everest-high-pass-trek.jpg", text: "MT Everest Trek", description: "A thrilling trek to the world's highest peak." },
      { src: "/Logo/gokyo-lake-and-renjo.jpg", text: "Gokyo Lake", description: "Serene glacial lakes in the Everest region." },
      { src: "/Logo/mardi-himal-trek.jpg", text: "Mardi Himal Trek", description: "A short yet challenging trek to Mardi Himal." },
      { src: "/Logo/up-mustang Trek.jpg", text: "Mustang Trek", description: "Explore the mystical landscape of Upper Mustang." },
      { src: "/Logo/kanchenjunga-trek.jpg", text: "Kanchenjunga Trek", description: "A trek to the world’s third highest peak." },
    ],
  },
};

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("popular");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get("/api/route/all");
        setDestinations(response.data.data);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const openImage = (index) => {
    setSelectedImageIndex(index);
  };

  const closeImage = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    setSelectedImageIndex((prevIndex) => {
      const totalImages = routeData[selectedFilter].images.length;
      return (prevIndex + 1) % totalImages;
    });
  };

  const prevImage = () => {
    setSelectedImageIndex((prevIndex) => {
      const totalImages = routeData[selectedFilter].images.length;
      return (prevIndex - 1 + totalImages) % totalImages;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const selectedImage = selectedImageIndex !== null ? routeData[selectedFilter].images[selectedImageIndex] : null;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div
          className="relative rounded-2xl mb-12 h-[350px] flex items-center justify-center text-white text-center p-8 shadow-lg"
          style={{
            backgroundImage: `url(${routeData[selectedFilter].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="bg-black/60 absolute inset-0 rounded-2xl"></div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {routeData[selectedFilter].title}
            </h1>
            <p className="text-lg md:text-xl">{routeData[selectedFilter].message}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {Object.keys(routeData).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                selectedFilter === filter
                  ? "bg-green-600 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {routeData[filter].title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {routeData[selectedFilter].images.map((img, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => openImage(index)}
            >
              <img
                src={img.src}
                alt={img.text}
                className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {img.text}
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative max-w-4xl w-full p-4 bg-white rounded-lg shadow-lg">
              <img src={selectedImage.src} alt={selectedImage.text} className="w-full h-auto rounded-lg" />
              <h2 className="text-2xl font-bold mt-4">{selectedImage.text}</h2>
              <p className="text-gray-700">{selectedImage.description}</p>
              <button className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full" onClick={closeImage}>
                <X />
              </button>
              <button className="absolute top-1/2 left-4 bg-gray-800 text-white p-2 rounded-full" onClick={prevImage}>
                <ArrowLeft />
              </button>
              <button className="absolute top-1/2 right-4 bg-gray-800 text-white p-2 rounded-full" onClick={nextImage}>
                <ArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
