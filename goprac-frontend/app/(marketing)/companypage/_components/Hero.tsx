"use client";

import React, { useState } from "react";
import { logActivity } from "@/lib/activityLogger";
import {
  Send,
  Building2,
  User,
  Mail,
  Phone,
  Target,
  Sparkle,
  HandPlatter,
  CornerDownRight,
} from "lucide-react";
import Users from "@/app/(main)/(dashboards)/users/page";

const Hero = ({ contactRef }) => {
  const [formData, setFormData] = useState({
    // productType: "",
    company: "",
    // name: "",
    email: "",
    phone: "",
    website: "", // honeypot
  });

  const [errors, setErrors] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isEmail = (email: string) =>
    /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.website) {
      logActivity("BOT_ATTACK", "Honeypot field was filled in companypage");
      setSuccessMessage("Thanks for your submission!");
      setTimeout(() => setSuccessMessage(""), 10000);
      return;
    }

    let hasError = false;
    const newErrors = { company: "", name: "", email: "", phone: "" };

    // Validation
    if (!formData.company) {
      newErrors.company = "Company Name cannot be empty";
      hasError = true;
    }
    // if (!formData.name) {
    //   newErrors.name = "Name cannot be empty";
    //   hasError = true;
    // }
    if (!formData.email) {
      newErrors.email = "Email cannot be empty";
      hasError = true;
    } else if (!isEmail(formData.email)) {
      newErrors.email = "Please Enter valid EmailId";
      hasError = true;
    }
    // Enhanced phone validation
    const cleanedPhone = formData.phone.replace(/\D/g, "");
    if (!formData.phone) {
      newErrors.phone = "Mobile Number cannot be empty";
      hasError = true;
    } else if (
      cleanedPhone.length !== 10 ||
      !["6", "7", "8", "9"].includes(cleanedPhone.charAt(0))
    ) {
      newErrors.phone =
        "Please enter a valid Mobile Number (10 digits, starts with 6, 7, 8, or 9)";
      hasError = true;
    }
    // if (!formData.phone) {
    //   newErrors.phone = "Mobile Number cannot be empty";
    //   hasError = true;
    // } else if (formData.phone.replace(/\D/g, '').length < 10) {
    //   newErrors.phone = "Please Enter valid Mobile Number";
    //   hasError = true;
    // }

    setErrors(newErrors);

    if (hasError) {
      // Scroll to form if error
      const formDiv =
        document.querySelector(".column-2") || document.querySelector("form");
      if (formDiv) formDiv.scrollIntoView({ behavior: "smooth" });
      // Clear errors after 10s
      setTimeout(
        () => setErrors({ company: "", name: "", email: "", phone: "" }),
        10000
      );
      logActivity(
        "FORM_SUBMIT_FAIL",
        `Validation failed: ${JSON.stringify(newErrors)}, values: ${JSON.stringify(formData)}`
      );
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    // Submit
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/index.php?registercompanyInfo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // productType: formData.productType,
            company: formData.company,
            // name: formData.name,
            phone_number: cleanedPhone, //only digits
            email: formData.email,
            source: "company",
            website: formData.website,
          }),
        }
      );
      const data = await response.json();

      if (data && data.status !== 0 && data[0] !== null) {
        setSuccessMessage(
          "Thanks for the interest. Our team will get back to you soon."
        );
        setFormData({ company: "", email: "", phone: "", website: "" });
        logActivity(
          "FORM_SUBMIT",
          `Submitted for company: ${formData.company}, email: ${formData.email}, phone: ${formData.phone}`
        );

      } else {
        setSuccessMessage("Submission failed. Please try again.");
        logActivity(
          "FORM_SUBMIT_FAIL",
          `API rejected: ${JSON.stringify(data)}, values: ${JSON.stringify(formData)}`
        );
      }
      setTimeout(() => setSuccessMessage(""), 10000);
    } catch (error) {
      setSuccessMessage("Error while retrieving the information");
      setTimeout(() => setSuccessMessage(""), 5000);
      logActivity(
        "FORM_SUBMIT_FAIL",
        `API/network error: ${error}, values: ${JSON.stringify(formData)}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative w-full bg-linear-to-r from-[#f7f8f8] to-[#e5ebf5] py-16 overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-linear-to-br from-indigo-200/40 via-purple-200/30 to-sky-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-sky-200/35 via-blue-200/25 to-violet-200/15 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[1.3fr_minmax(0,1fr)] items-start">
        {/* LEFT: text + stats */}
        <div className="flex flex-col gap-8">
          <div className="space-y-4 text-left">
            {/* <button className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/70 backdrop-blur-md px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm">
              <Sparkle size={14} className="text-indigo-500" />
              AI-Coach trained by FAANG & top-company professionals
            </button> */}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 ">
              Build{" "}
              <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent ">
                High-Performance{" "}
              </span>
              Teams
            </h1> <br />
            <span className="text-base sm:text-lg lg:text-xl tracking-normal text-gray-700">
              Strengthen Thinking Skills — critical thinking and problem-solving, with an AI-Coach trained by industry experts.
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl">
            <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg px-2 py-4 sm:px-4 sm:py-3 text-center shadow-lg shadow-indigo-100/50">
              <div className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                300+
              </div>
              <div className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">Experts Insights</div>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg px-2 py-4 sm:px-4 sm:py-3 text-center shadow-lg shadow-indigo-100/50">
              <div className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                5,000+
              </div>
              <div className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">Learners</div>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg px-2 py-4 sm:px-4 sm:py-3 text-center shadow-lg shadow-indigo-100/50">
              <div className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                50,500+
              </div>
              <div className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">Training Hours</div>
            </div>
          </div>
        </div>

        {/* RIGHT: existing form */}
        <div className="w-full max-w-md ml-auto">
          <div ref={contactRef} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 w-full max-w-lg">
            <div className="w-full text-center mb-8">
              <div className="flex flex-col items-center justify-center gap-3 mb-4 mx-auto">
                <div className="bg-[#e4f1ff] rounded-full p-2 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-blue-600 font-semibold text-base sm:text-lg text-center">
                  Request a Demo
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Type Radio Buttons */}
              {/* <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400" size={20} />
                  <label className="text-sm font-medium text-gray-700">I am interested in:</label>
                </div>
                <div className="flex gap-6 pl-7">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      value="Hiring"
                      checked={formData.productType === 'Hiring'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 focus:ring-2"
                      required
                    />
                    <span className="text-sm text-gray-700">Hiring</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      value="Upskilling"
                      checked={formData.productType === 'Upskilling'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 focus:ring-2"
                      required
                    />
                    <span className="text-sm text-gray-700">Upskilling</span>
                  </label>
                </div>
              </div> */}

              {/* Honeypot field */}
              <div className="hp-field" aria-hidden="true">
                <label htmlFor="website" className="hp-label">
                  Website
                  <input
                    type="text"
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </label>
              </div>

              <div className="relative">
                <Building2
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                  required
                />
                {errors.company && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.company}
                  </div>
                )}
              </div>

              {/* <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                  required
                />
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                )}
              </div> */}

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                  pattern="^[^\s@]+@(?!gmail\.com$)(?!yahoo\.[a-z.]+$)(?!hotmail\.[a-z.]+$)(?!outlook\.[a-z.]+$)(?!live\.[a-z.]+$)(?!aol\.[a-z.]+$)(?!icloud\.[a-z.]+$)(?!protonmail\.[a-z.]+$)(?!gmx\.[a-z.]+$)(?!yandex\.[a-z.]+$)(?!zoho\.[a-z.]+$)(?!mail\.ru$)(?!rediffmail\.[a-z.]+$)[^\s@]+\.[^\s@]+$"
                  required
                  title="Please enter a valid corporate email address (not from Gmail, Yahoo, etc.)"
                />
                {errors.email && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                  required
                  pattern="^(\+?\d{1,3})?[6789]\d{9}$"
                  title="Phone number must be 10 digits and start with 6, 7, 8, or 9 (e.g., 6360060622 or +916360060622)"
                />
                {errors.phone && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.phone}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer w-full bg-linear-to-r from-blue-500 to-blue-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
              >
                <Send size={20} />
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>

              {successMessage && (
                <div
                  id="successMessage"
                  className="text-green-600 text-center my-2"
                >
                  {successMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
