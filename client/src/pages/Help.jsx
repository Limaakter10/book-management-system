import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaBook,
  FaShoppingCart,
  FaUser,
  FaChevronDown,
  FaHeadset,
  FaQuestionCircle
} from "react-icons/fa";

const Help = () => {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I purchase a book?",
      answer: "Go to the shop page, add books to your cart, and proceed to checkout to complete payment securely."
    },
    {
      question: "Where can I find my purchased books?",
      answer: "All purchased books are available in your Library section after successful payment."
    },
    {
      question: "What payment methods are available?",
      answer: "We support cards, mobile banking, and SSLCommerz payment gateway."
    },
    {
      question: "Can I get a refund?",
      answer: "Refund policies depend on the product. Please contact support for assistance."
    },
    {
      question: "How do I contact support?",
      answer: "You can contact support using the button below or email us directly."
    },
    {
      question: "Can I access books offline?",
      answer: "Currently, books are accessible online through your account library."
    },
    {
      question: "Why is my payment not working?",
      answer: "Please check your payment details or try another method. If the issue continues, contact support."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* HERO */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-2">
          <FaQuestionCircle /> Help Center
        </h1>

        <p className="text-gray-300 mb-6">
          Find answers, guides, and support
        </p>

        {/* SEARCH */}
        <div className="max-w-xl mx-auto flex items-center bg-white rounded-lg p-3 shadow">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-black"
          />
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 p-6 -mt-10">

        <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-xl transition">
          <FaBook className="text-3xl text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold">Books & Reading</h3>
          <p className="text-sm text-gray-500 mt-1">
            Learn about books and library
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-xl transition">
          <FaShoppingCart className="text-3xl text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold">Orders & Payment</h3>
          <p className="text-sm text-gray-500 mt-1">
            Payment and checkout help
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-xl transition">
          <FaUser className="text-3xl text-purple-500 mx-auto mb-3" />
          <h3 className="font-semibold">Login & Registration</h3>
          <p className="text-sm text-gray-500 mt-1">
            Sign up, login, and logout help
          </p>
        </div>

      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto p-6">

        <h2 className="text-2xl font-bold mb-6 text-[#0f172a] flex items-center gap-2">
          <FaQuestionCircle /> Frequently Asked Questions
        </h2>

        {filteredFaqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow mb-4">

            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex justify-between items-center p-4 font-semibold text-left"
            >
              {faq.question}
              <FaChevronDown
                className={`transition ${openIndex === index ? "rotate-180" : ""}`}
              />
            </button>

            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-600 text-sm">
                {faq.answer}
              </div>
            )}

          </div>
        ))}

      </div>

      {/* CONTACT */}
      <div className="text-center py-12 bg-white mt-10">

        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
          <FaHeadset /> Still need help?
        </h3>

        <p className="text-gray-500 mb-4">
          Our support team is here for you
        </p>

        <Link
          to="/contact"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 inline-block"
        >
          Contact Support
        </Link>

      </div>

    </div>
  );
};

export default Help;