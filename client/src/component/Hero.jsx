import React from "react";
import { NavLink } from "react-router-dom";

const Hero = () => {
  return (
    <div className="bg-[#0e5a6f] text-white px-6 py-12">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">

        {/* ================= LEFT TEXT ================= */}
        <div className="flex-1">

          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Welcome to Our <br />
            <span className="text-yellow-400">Books</span> – a haven for <br />
            book lovers
          </h1>

          {/* ================= ACTION BOX ================= */}
          <div className="mt-6">
            <div className="bg-[#f2f9fb] p-3 rounded-md flex items-center gap-4 shadow-sm">

              {/* LEFT BOX */}
              <div className="bg-white px-15 py-2 rounded-md text-sm shadow">
                <p className="text-[#0e5a6f]">New to ReadNOVA?</p>
                <NavLink
                  to="/about"
                  className="text-[#0e5a6f] cursor-pointer hover:underline"
                >
                  Learn more
                </NavLink>
              </div>

              {/* SHOP BUTTON */}
              <div className="flex flex-1 justify-end">
                <NavLink
                  to="/shop"
                  className="bg-white text-[#0e5a6f] px-8 py-4 rounded-md font-semibold shadow hover:bg-gray-100 transition"
                >
                  🛒 Shop Now
                </NavLink>
              </div>

            </div>
          </div>

        </div> {/* FIX: CLOSED LEFT DIV */}

        {/* ================= RIGHT IMAGE ================= */}
        <div className="flex-1">
          <img
            src="https://images.theconversation.com/files/45159/original/rptgtpxd-1396254731.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=1356&h=668&fit=crop"
            alt="Books"
            className="rounded-xl w-full h-[300px] object-cover shadow-lg"
          />
        </div>

      </div>

    </div>
  );
};

export default Hero;