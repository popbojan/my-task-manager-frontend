import './login.css'

export default function LoginPage() {
    return (
        <div className="login">
            <div className="login-card">
                <h1 className="login-title">Anmelden</h1>
                <p className="login-subtitle">
                    Wir schicken Ihnen einen Einmalcode per E-Mail.
                </p>

                <div className="login-field">
                    <label>E-Mail-Adresse</label>
                    <input
                        type="email"
                        placeholder="name@domain.com"
                    />
                </div>

                <button className="login-button">
                    Code senden
                </button>
            </div>
        </div>
    )
}
