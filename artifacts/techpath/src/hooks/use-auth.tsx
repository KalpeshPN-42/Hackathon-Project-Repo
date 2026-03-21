import { createContext, useContext, useEffect } from "react";
import { useGetCurrentUser, useLogin, useRegister, useLogout } from "@workspace/api-client-react";
import type { User, LoginRequest, RegisterRequest } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetCurrentUser({
    query: { retry: false },
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const handleLogin = async (data: LoginRequest): Promise<User> => {
    const result = await loginMutation.mutateAsync({ data });
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    const u = (result as any).user as User;
    const redirect = u.role === "admin" ? "/admin" : u.role === "recruiter" ? "/recruiter" : "/jobs";
    setLocation(redirect);
    return u;
  };

  const handleRegister = async (data: RegisterRequest): Promise<User> => {
    const result = await registerMutation.mutateAsync({ data });
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    const u = (result as any).user as User;
    const redirect = u.role === "recruiter" ? "/recruiter" : "/profile";
    setLocation(redirect);
    return u;
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(["/api/auth/me"], null);
    setLocation("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
