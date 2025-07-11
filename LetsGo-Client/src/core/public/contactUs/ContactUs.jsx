import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import {
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Twitter,
} from "lucide-react";
import { useState } from "react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/contact", formData);
      setStatus({ type: "success", message: "Message sent successfully!" });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div>
        <Navbar/>
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="relative bg-green-600 text-white py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Get in Touch
                </h1>
                <p className="text-lg md:text-xl opacity-90">
                  Have questions about our services? We're here to help!
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50 clip-triangle"></div>
          </div>

          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-6">
                      Send us a Message
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Send className="mr-2 h-5 w-5" />
                            Send Message
                          </div>
                        )}
                      </Button>
                      {status && (
                        <p
                          className={`text-center ${
                            status.type === "success"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {status.message}
                        </p>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <h2 className="text-2xl font-semibold mb-6">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Our Location</h3>
                        <p className="text-gray-600">Birgunj, Nepal</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Phone Number</h3>
                        <p className="text-gray-600">+977 9812345678</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Email Address</h3>
                        <p className="text-gray-600">info@letsgo.com</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Working Hours</h3>
                        <p className="text-gray-600">
                          Mon - Fri: 9:00 AM - 6:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-2xl font-semibold mb-6">Follow Us</h2>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="bg-blue-500 p-3 rounded-lg text-white hover:bg-blue-600 transition-colors"
                    >
                      <Facebook className="h-6 w-6" />
                    </a>
                    <a
                      href="#"
                      className="bg-blue-400 p-3 rounded-lg text-white hover:bg-blue-500 transition-colors"
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                    <a
                      href="#"
                      className="bg-pink-500 p-3 rounded-lg text-white hover:bg-pink-600 transition-colors"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a
                      href="#"
                      className="bg-blue-600 p-3 rounded-lg text-white hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="h-6 w-6" />
                    </a>
                  </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-2xl font-semibold mb-6">
                    Find Us on Map
                  </h2>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57120.88551689721!2d84.83742641978711!3d27.010174763341767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39935446b21c98b5%3A0x81a85e4beae9faaf!2sBirgunj%2C%20Nepal!5e0!3m2!1sen!2snp!4v1705658641606!5m2!1sen!2snp"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;