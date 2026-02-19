import './login.css'
import {useMutation} from "@tanstack/react-query";
import {authApi} from "../api/authClient.js";
import {useState} from "react";

export default function LoginPage() {
    const [email, setEmail] = useState('')

    const requestOtpMutation = useMutation({
        mutationFn: () => authApi.requestOtp({ email }),
        onSuccess: (data) => {
            console.log('OTP requested:', data)
        },
    })


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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                    />
                </div>

                <button className="login-button"
                        onClick={() => requestOtpMutation.mutate()}
                        disabled={!email || requestOtpMutation.isPending}
                >
                    {requestOtpMutation.isPending ? 'Sende…' : 'Code senden'}
                </button>
            </div>
        </div>
    )
}
