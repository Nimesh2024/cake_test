import Logo from '../components/common/Logo';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            addToast('Login successful!', 'success');
            navigate('/');
        } catch (error) {
            addToast(error.response?.data?.message || 'Login failed. Please check credentials.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Logo
                        size="lg"
                        className="flex-col !gap-6 mb-6"
                        textClassName="text-4xl text-gray-900 dark:text-white"
                    />
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Management System Portal</p>
                </div>

                <Card className="p-8 border-none shadow-2xl shadow-gray-200/50 dark:shadow-none">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold dark:text-white">Welcome Back</h2>
                            <p className="text-sm text-gray-500">Please sign in to your staff account</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="name@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-11"
                                />
                                <Mail size={18} className="absolute left-4 top-[42px] text-gray-400" />
                            </div>

                            <div className="relative">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-11"
                                />
                                <Lock size={18} className="absolute left-4 top-[42px] text-gray-400" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-4 rounded-2xl text-lg font-bold shadow-lg shadow-primary-500/30"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" /> Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </Card>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Protected by secure enterprise-grade systems
                </p>
            </div>
        </div>
    );
};

export default Login;
