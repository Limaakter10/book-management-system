import {
  FaBookOpen,
  FaLaptopCode,
  FaUserGraduate,
  FaShieldAlt
} from "react-icons/fa";

const About = () => {
  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-[#0e5a6f] mb-4">
          About ReadNOVA
        </h1>

        <p className="text-gray-700 leading-7">
          ReadNOVA is a modern eBook platform built to empower Computer Science
          students and professionals by providing high-quality academic and
          career-focused learning resources in one place.
        </p>
      </div>

      {/* ================= FEATURES ================= */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* 🔥 CARD 1 */}
        <div className="flex gap-4 bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <FaLaptopCode className="text-3xl text-[#0e5a6f]" />
          <div>
            <h3 className="font-semibold text-lg">
              Tech-Focused Learning
            </h3>
            <p className="text-gray-600 text-sm">
              Explore AI, Machine Learning, Software Engineering,
              Data Science and more.
            </p>
          </div>
        </div>

        {/* 🔥 CARD 2 */}
        <div className="flex gap-4 bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <FaUserGraduate className="text-3xl text-[#0e5a6f]" />
          <div>
            <h3 className="font-semibold text-lg">
              Career Development
            </h3>
            <p className="text-gray-600 text-sm">
              Learn Web Development, Freelancing, and Digital skills
              for real-world success.
            </p>
          </div>
        </div>

        {/* 🔥 CARD 3 */}
        <div className="flex gap-4 bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <FaBookOpen className="text-3xl text-[#0e5a6f]" />
          <div>
            <h3 className="font-semibold text-lg">
              Personal Library
            </h3>
            <p className="text-gray-600 text-sm">
              Access your purchased books anytime in a clean,
              organized reading environment.
            </p>
          </div>
        </div>

        {/* 🔥 CARD 4 */}
        <div className="flex gap-4 bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <FaShieldAlt className="text-3xl text-[#0e5a6f]" />
          <div>
            <h3 className="font-semibold text-lg">
              Secure Platform
            </h3>
            <p className="text-gray-600 text-sm">
              Safe payments, smooth checkout, and reliable performance.
            </p>
          </div>
        </div>

      </div>

      {/* ================= MISSION ================= */}
      <div className="bg-[#f8fbfc] p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-2 text-[#0e5a6f]">
          Our Mission
        </h2>

        <p className="text-gray-700 leading-7">
          Our mission is to make knowledge accessible, affordable, and practical.
          We aim to bridge the gap between academic learning and industry skills,
          helping learners grow both academically and professionally.
        </p>
      </div>

    </div>
  );
};

export default About;