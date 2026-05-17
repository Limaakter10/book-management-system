import {
  FaUndoAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEnvelope,
  FaShieldAlt
} from "react-icons/fa";

const RefundPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold flex justify-center items-center gap-2">
            <FaUndoAlt className="text-blue-600" />
            Refund Policy
          </h1>
          <p className="text-gray-500 mt-2">
            Last updated: May 2026
          </p>
        </div>

        {/* INTRO */}
        <p className="text-gray-700 mb-6 leading-relaxed">
          We strive to provide high-quality digital products and services.
          Please review our refund policy carefully before making a purchase.
        </p>

        {/* ELIGIBLE */}
        <Section
          icon={<FaCheckCircle className="text-green-600" />}
          title="Eligible for Refund"
          items={[
            "Incorrect or duplicate charges",
            "Payment completed but product not delivered",
            "Technical issue preventing access",
            "Corrupted or unusable file"
          ]}
        />

        {/* NOT ELIGIBLE */}
        <Section
          icon={<FaTimesCircle className="text-red-500" />}
          title="Non-Refundable Cases"
          items={[
            "Change of mind after purchase",
            "Accidental purchase",
            "Not satisfied with content",
            "Product already accessed"
          ]}
        />

        {/* TIME */}
        <Section
          icon={<FaClock className="text-yellow-500" />}
          title="Refund Request Time"
          items={[
            "Refund requests must be submitted within 48 hours of purchase"
          ]}
        />

        {/* CONTACT */}
        <Section
          icon={<FaEnvelope className="text-blue-500" />}
          title="How to Request a Refund"
          items={[
            "Provide your Name and Email",
            "Include Order / Transaction ID",
            "Explain the issue clearly",
            "Send request to: support@readnova.com"
          ]}
        />

        {/* PROCESS */}
        <Section
          icon={<FaUndoAlt className="text-purple-500" />}
          title="Refund Process"
          items={[
            "Review and approval of request",
            "Processing within 5–7 business days",
            "Refund issued to original payment method"
          ]}
        />

        {/* SECURITY */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
          <FaShieldAlt className="text-blue-600 text-xl mt-1" />
          <p className="text-gray-700">
            We reserve the right to deny fraudulent or abusive refund requests.
            Accounts abusing refund policies may be restricted.
          </p>
        </div>

      </div>
    </div>
  );
};

// 🔥 REUSABLE SECTION
const Section = ({ icon, title, items }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
      {icon} {title}
    </h2>

    <ul className="list-disc pl-6 text-gray-700 space-y-1">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

export default RefundPolicy;