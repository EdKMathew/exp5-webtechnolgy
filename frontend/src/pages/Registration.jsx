import { useState } from "react";
import api from "../api";

function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};

    if (name.trim() === "") {
      newErrors.name = "Name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }

    setErrors(newErrors);

    // Object.keys(newErrors).length is 0 only when there are no errors at all
    if (Object.keys(newErrors).length === 0) {
      try {
        await api.post("/api/registrations", { name, email, phone });
        setSubmitted(true);
      } catch (err) {
        setErrors({ form: err.response?.data?.message || "Could not register. Try again." });
      }
    }
  }

  if (submitted) {
    return (
      <div className="page">
        <h1>Thank you, {name}!</h1>
        <p>You have been registered successfully.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Registration</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="r-name">Name</label>
        <input id="r-name" value={name} onChange={(e) => setName(e.target.value)} />
        {errors.name && <p className="error-msg">{errors.name}</p>}

        <label htmlFor="r-email">Email</label>
        <input id="r-email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="error-msg">{errors.email}</p>}

        <label htmlFor="r-phone">Mobile Number</label>
        <input id="r-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {errors.phone && <p className="error-msg">{errors.phone}</p>}

        {errors.form && <p className="error-msg">{errors.form}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Registration;
