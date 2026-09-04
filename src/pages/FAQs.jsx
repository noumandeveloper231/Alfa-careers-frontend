import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import AnnouncementBar from "../components/AnnouncementBar";

const FAQs = () => {
  const tabs = ["Company", "Candidate", "Privacy Policy", "Security"];
  const [activeTab, setActiveTab] = useState("Company");
  const [openIndex, setOpenIndex] = useState(0); // one open by default

  const questionsByTab = {
    Company: [
      {
        q: "How and when was Civi started?",
        a: "Civi was launched to simplify job matching using modern tools, helping both companies and candidates connect faster and smarter.",
      },
      {
        q: "How can I join your team?",
        a: "You can apply through our Careers page. We regularly post openings for engineering, design, content, and support roles.",
      },
      {
        q: "How is Civi different from other places to post jobs?",
        a: "Civi uses smart filters and matching algorithms so companies get relevant applicants instead of random resumes.",
      },
      {
        q: "What types of candidates can I find on Civi?",
        a: "You can find candidates across tech, marketing, finance, operations, and creative fields.",
      },
    ],

    Candidate: [
      {
        q: "What types of candidates can I find on Civi?",
        a: "Civi attracts skilled individuals from various industries, especially tech, marketing, and design.",
      },
      {
        q: "How and when was Civi started?",
        a: "Civi began with the mission to make job searching and hiring simple, transparent, and effective.",
      },
      {
        q: "How can I join your team?",
        a: "Check our Careers page for open roles. We welcome passionate contributors!",
      },
      {
        q: "How is Civi different from other places to post jobs?",
        a: "We focus on matching quality over quantity, ensuring job seekers get the right opportunities.",
      },
    ],

    "Privacy Policy": [
      {
        q: "How is Civi different from other places to post jobs?",
        a: "We maintain strong confidentiality. Data is only used for improving job matching and never sold.",
      },
      {
        q: "How and when was Civi started?",
        a: "Civi was built by a team focused on trust, privacy, and modern recruitment.",
      },
      {
        q: "How can I join your team?",
        a: "Apply through our Careers page and follow the hiring steps.",
      },
      {
        q: "What types of candidates can I find on Civi?",
        a: "A wide range of verified and skilled professionals.",
      },
    ],

    Security: [
      {
        q: "How can I join your team?",
        a: "Visit our recruitment page for application details and hiring flows.",
      },
      {
        q: "How and when was Civi started?",
        a: "Civi was launched to create a reliable and secure hiring ecosystem.",
      },
      {
        q: "How is Civi different from other places to post jobs?",
        a: "We maintain secure data encryption and safe authentication methods to protect users.",
      },
      {
        q: "What types of candidates can I find on Civi?",
        a: "Professionals from different domains who undergo verification.",
      },
    ],
  };

  return (
    <div>
      <AnnouncementBar />
      <Navbar />

      <div className="my-16 w-full max-w-3xl px-4 mx-auto">
        <p className="font-semibold text-black text-center">FAQ'S</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-black mt-2">
          Any questions? We’re here to help
        </h2>

        {/* Tabs */}
        <div className="mt-10 flex items-center justify-center gap-6">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setActiveTab(t);
                setOpenIndex(0);
              }}
              className={`text-sm sm:text-base text-black font-medium pb-1 ${
                activeTab === t ? "border-b-2 border-black" : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="mt-8 space-y-6">
          {questionsByTab[activeTab].map((item, i) => {
            const open = openIndex === i;

            return (
              <div
                key={i}
                className="rounded-3xl border border-gray-200 bg-white cursor-pointer transition"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-6 py-6"
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span className="text-black font-medium">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-black transition-transform duration-600 ${
                      open ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {/* Answer with smooth animation */}
                <div
                  className={`overflow-hidden transition-all duration-600 ${
                    open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-gray-600">{item.a}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-8 text-center">
          <p className="text-sm text-black">
            Have a question not covered in the FAQ?
          </p>
          <button className="mt-3 primary-btn">Contact us</button>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
