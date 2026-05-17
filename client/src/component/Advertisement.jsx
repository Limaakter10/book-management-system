import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

import { FaTag } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import { AiOutlineFire } from "react-icons/ai";

const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const Advertisement = () => {
  const [ads, setAds] = useState([]);

  // ================= FETCH ADS =================
  useEffect(() => {
    api
      .get("/api/ads")
      .then((res) => {
        console.log("ADS:", res.data);
        setAds(res.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // ================= ICON LOGIC =================
  const getIcon = (discount) => {
    if (discount === "50%")
      return <AiOutlineFire className="text-red-500" />;
    if (discount === "BOGO")
      return <MdLocalOffer className="text-green-500" />;
    return <FaTag className="text-blue-500" />;
  };

  return (
    <div className="bg-[#f2f9fb] py-12 px-6 mt-10">

      <h2 className="text-2xl font-bold text-center text-[#0e5a6f] mb-8">
        Special Offers
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        {ads.map((ad) => (
          <div
            key={ad._id}
            className="bg-white rounded-xl shadow hover:shadow-2xl transition flex flex-col h-[300px]"
          >

            {/* ✅ IMAGE FIX */}
            <img
              src={
                ad.image
                  ? ad.image.startsWith("http")
                    ? ad.image
                    : `${BASE_URL}${ad.image}`
                  : "https://via.placeholder.com/300"
              }
              alt={ad.title}
              className="w-full h-40 object-cover rounded-t-xl"
            />

            <div className="p-4 flex flex-col flex-grow">

              <div className="flex items-center gap-2 mb-2">
                {getIcon(ad.discount)}
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  {ad.discount}
                </span>
              </div>

              <h3 className="font-semibold text-sm line-clamp-1">
                {ad.title}
              </h3>

              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {ad.description}
              </p>

              <div className="mt-auto">
                <Link
                  to={ad.link}
                  className="inline-block mt-3 bg-[#0e5a6f] text-white px-3 py-1 text-sm rounded hover:bg-[#094a5c]"
                >
                  Shop Now →
                </Link>
              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Advertisement;