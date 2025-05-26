import React, { useState } from "react";
import "./RegisterForm.css";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    confirmPassword: ""
  });
  const [status, setStatus] = useState({ error: "", success: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", success: "" });

    if (formData.password !== formData.confirmPassword) {
      setStatus({ error: "Hasła się nie zgadzają", success: "" });
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          login: formData.login.trim(),
          password: formData.password
        }),
        credentials: "include" // Only if using cookies/sessions
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nie udało się zarejestrować");
      }

      setStatus({ 
        success: data.message || "Rejestracja zakończona pomyślnie!",
        error: "" 
      });
      setFormData({
        login: "",
        password: "",
        confirmPassword: ""
      });
    } catch (err) {
      console.error("Registration error:", err);
      setStatus({
        error: err.message || "Błąd połączenia z serwerem",
        success: ""
      });
    }
  };

  return (
    <div className="register-container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="login"
          placeholder="Login"
          value={formData.login}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={20}
        />
        <input
          type="password"
          name="password"
          placeholder="Hasło"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Powtórz hasło"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
        />
        <button type="submit">Zarejestruj się</button>
        
        {status.error && (
          <p className="error" role="alert">
            {status.error}
          </p>
        )}
        {status.success && (
          <p className="success" role="status">
            {status.success}
          </p>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;