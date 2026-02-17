"use client";

import React, { useState } from "react";
import { logActivity } from "@/lib/activityLogger";
import {
  Send,
  Building2,
  User,
  Mail,
  Phone,
} from "lucide-react";

const ContactForm = ({ contactRef }) => {
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    website: "", //honeypot field 
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
      logActivity("BOT_ATTACK", "Honeypot field was filled");
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
    if (!formData.name) {
      newErrors.name = "Name cannot be empty";
      hasError = true;
    }
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
            company: formData.company,
            name: formData.name,
            phone_number: cleanedPhone, //only digits
            email: formData.email,
            source: "home",
             website: formData.website,
          }),
        }
      );
      const data = await response.json();

      if (data && data.status !== 0 && data[0] !== null) {
        setSuccessMessage(
          "Thanks for the interest. Our team will get back to you soon."
        );
        setFormData({ company: "", name: "", email: "", phone: "", website: "" });
        logActivity(
          "FORM_SUBMIT",
          `Submitted for company: ${formData.company}, name: ${formData.name}, email: ${formData.email}, phone: ${formData.phone}`
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 w-full max-w-lg">

            <div className="bg-[#e4f1ff] rounded-full p-2 w-12 h-12 flex items-center justify-center mb-6 shadow-md border border-blue-200 mx-auto ">
                <User className="w-6 h-6 text-blue-600" />
            </div>

            <div className="w-full text-center mb-8">
            
                <div className="flex items-center justify-center gap-2 mb-4">
                                
                    <span className="text-blue-600 font-semibold text-base sm:text-lg ">
                        Contact Us for Customized Thinking Skills Program.
                    </span>
                </div>
                          
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

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
                  ref={contactRef}
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

              <div className="relative">
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
              </div>

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
                  required
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
                className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
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
  );
};

export default ContactForm;
