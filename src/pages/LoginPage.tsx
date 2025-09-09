import { useState, type FormEvent } from 'react';
import { Building2, Eye, EyeOff, Lock, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useAppDispatch, useAppSelector } from '@/store/hook';
import { loginThunk } from '@/store/thunks/authThunks';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { error, isLoading } = useAppSelector(state => state.auth)

  const dispatch = useAppDispatch();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginThunk({ username, password }))

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900 p-4">

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/30 rounded-full blur-xl"></div>
                <div className="relative bg-gradient-to-br from-teal-600 to-teal-700 p-6 rounded-full shadow-lg">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>

            <div>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Login
              </CardTitle>
            </div>
          </CardHeader>

          <div onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-700/50 backdrop-blur-sm">
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300 font-medium">
                  Employee ID
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your employee ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-teal-500/50 focus:ring-teal-500/20 backdrop-blur-sm h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">
                  Password
                </Label>
                <div className="relative flex items-center-safe">
                  <Lock className="absolute left-3 h-5 w-5 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-teal-500/50 focus:ring-teal-500/20 backdrop-blur-sm h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

            </CardContent>

            <CardFooter className="pt-6 pb-8">
              <Button
                type="submit"
                onClick={handleSubmit}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                disabled={isLoading || false}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardFooter>
          </div>
        </Card>


      </div>
    </div>
  );
};

export default LoginPage;