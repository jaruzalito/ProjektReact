import React from "react";
import LoginForm from "../LoginForm";

function LoginPage({ onLogin, user }) {
  return (
    <div className="login-page">
      <div className="login-page-content">
        <div className="login-header">
          <h1>Zaloguj się do Instagram Checker</h1>
          <p>Aby sprawdzać profile i dodawać opinie, musisz się zalogować</p>
        </div>

        <LoginForm onLogin={onLogin} />

        {user && (
          <div className="user-welcome">
            <p>Witaj z powrotem, {user.login}!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
