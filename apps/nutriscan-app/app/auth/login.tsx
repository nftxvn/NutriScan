import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react-native";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Login: Calling API...");
      const response = await api.post("/auth/login", { email, password });
      console.log("Login: API Response:", response.data);
      const { user, token } = response.data.data;
      
      // Save token directly before signIn
      console.log("Login: Saving token directly...");
      const { setAuthToken } = require("../../api/client");
      await setAuthToken(token);
      console.log("Login: Token saved, calling signIn...");
      
      await signIn(token, user);
      console.log("Login: signIn completed, navigating to home...");
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log("Login: Error:", err);
      setError(err.response?.data?.message || "Ups! Email atau password yang kamu masukkan salah.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue your progress.</Text>

        {error ? (
           <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, marginTop: 16 }}>
              <AlertCircle size={20} color="#ef4444" />
              <Text style={{ color: '#ef4444', marginLeft: 8, fontSize: 13 }}>{error}</Text>
           </View>
        ) : null}

        <View style={styles.form}>
           <View style={styles.inputGroup}>
             <Text style={styles.label}>Email Address</Text>
             <View style={styles.inputContainer}>
               <Mail size={20} color="#666" />
               <TextInput
                 style={styles.input}
                 placeholder="john@example.com"
                 placeholderTextColor="#555"
                 value={email}
                 onChangeText={setEmail}
                 keyboardType="email-address"
                 autoCapitalize="none"
               />
             </View>
           </View>

           <View style={styles.inputGroup}>
             <Text style={styles.label}>Password</Text>
             <View style={styles.inputContainer}>
               <Lock size={20} color="#666" />
               <TextInput
                 style={styles.input}
                 placeholder="••••••••"
                 placeholderTextColor="#555"
                 value={password}
                 onChangeText={setPassword}
                 secureTextEntry={!showPassword}
               />
               <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                 {showPassword ? (
                   <EyeOff size={20} color="#666" />
                 ) : (
                   <Eye size={20} color="#666" />
                 )}
               </TouchableOpacity>
             </View>
           </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, (loading || !email || !password) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || !email || !password}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? "Logging in..." : "Log In"}</Text>
            {!loading && <ArrowRight size={20} color="#000" />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/account-setup")}>
            <Text style={styles.loginText}>
              Don't have an account? <Text style={styles.loginLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 60,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 8,
  },
  form: {
    marginTop: 32,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "white",
  },
  footer: {
    paddingBottom: 40,
    gap: 16,
  },
  button: {
    backgroundColor: "#d3f660",
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: "#3a3a3a",
  },
  buttonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "700",
  },
  loginText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  loginLink: {
    color: "#d3f660",
    fontWeight: "600",
  },
});
