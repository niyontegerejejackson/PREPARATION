import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBed, FaWifi, FaCoffee, FaSwimmingPool, FaConciergeBell, FaStar } from 'react-icons/fa';

const Landing = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="font-sans text-slate-800 bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 bg-transparent py-4 px-8 flex justify-between items-center text-white">
        <div className="flex items-center text-2xl font-bold tracking-widest">
          <FaBed className="mr-2 text-indigo-400" /> HOTELPRO
        </div>
        <div className="space-x-6">
          <Link to="/login" className="hover:text-indigo-300 transition">Log In</Link>
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-full font-semibold transition shadow-lg">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-c6a4d14d8379?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)' }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <motion.div 
          initial="hidden" animate="visible" variants={fadeIn}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
            Experience <span className="text-indigo-400">Luxury</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
            HotelPro Rwanda Ltd offers the finest hospitality services in Kigali City. Your perfect stay begins here.
          </p>
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full text-lg font-bold transition shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.8)]">
            Book Your Stay Now
          </Link>
        </motion.div>
      </div>

      {/* About Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="py-20 px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">About HotelPro</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            Located in the heart of Kigali City, Rwanda, HotelPro provides world-class accommodation, exquisite dining, and state-of-the-art conference facilities. We blend modern luxury with traditional Rwandan hospitality to ensure every guest has an unforgettable experience.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            Whether you are here for business or leisure, our dedicated team is committed to delivering exceptional service tailored to your needs.
          </p>
        </div>
        <div className="md:w-1/2">
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Hotel Interior" className="rounded-2xl shadow-2xl" />
        </div>
      </motion.section>

      {/* Services Section */}
      <section className="bg-slate-50 py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Our Services</h2>
            <p className="text-slate-600 mt-4">Everything you need for a perfect stay</p>
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <FaWifi />, title: "Free High-Speed Wi-Fi", desc: "Stay connected anywhere in the hotel." },
              { icon: <FaSwimmingPool />, title: "Swimming Pool", desc: "Relax in our temperature-controlled pool." },
              { icon: <FaCoffee />, title: "Restaurant & Bar", desc: "Enjoy local and international cuisines." },
              { icon: <FaConciergeBell />, title: "24/7 Concierge", desc: "We are here to help you around the clock." }
            ].map((srv, i) => (
              <motion.div key={i} variants={fadeIn} className="bg-white p-8 rounded-xl shadow-lg text-center hover:-translate-y-2 transition duration-300">
                <div className="text-5xl text-indigo-500 mb-6 flex justify-center">{srv.icon}</div>
                <h3 className="text-xl font-bold mb-3">{srv.title}</h3>
                <p className="text-slate-500">{srv.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900">Guest Testimonials</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "John Doe", text: "The best hotel experience I've ever had in Kigali. The staff was incredibly welcoming.", stars: 5 },
            { name: "Jane Smith", text: "Beautiful rooms and excellent food. I highly recommend HotelPro to anyone visiting Rwanda.", stars: 5 },
            { name: "Michael Johnson", text: "Perfect location for my business trip. The conference facilities are top-notch.", stars: 4 }
          ].map((test, i) => (
            <div key={i} className="bg-indigo-50 p-8 rounded-xl shadow-md border border-indigo-100">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(test.stars)].map((_, i) => <FaStar key={i} />)}
              </div>
              <p className="text-slate-700 italic mb-6">"{test.text}"</p>
              <p className="font-bold text-slate-900">- {test.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center text-2xl font-bold tracking-widest text-white mb-4">
              <FaBed className="mr-2 text-indigo-400" /> HOTELPRO
            </div>
            <p className="text-sm text-slate-400">Luxury, comfort, and exceptional service in the heart of Kigali.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact Us</h4>
            <p className="text-sm mb-2">123 KG Avenue, Kigali, Rwanda</p>
            <p className="text-sm mb-2">info@hotelpro.rw</p>
            <p className="text-sm">+250 788 123 456</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-indigo-400">Login</Link></li>
              <li><Link to="/register" className="hover:text-indigo-400">Register</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} HotelPro Rwanda Ltd. All rights reserved. Developed for National Practical Exam.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
