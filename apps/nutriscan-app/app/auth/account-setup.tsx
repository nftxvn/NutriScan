import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "lucide-react-native";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function AccountSetup() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);

  const isValidPassword = password.length >= 8;

  const handleContinue = async () => {
    setError("");
    setEmailError(false);

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isValidPassword) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service");
      return;
    }

    setLoading(true);
    
    try {
      // Check if email is already in use
      const response = await api.post("/auth/check-email", { email });
      const { available } = response.data.data;
      
      if (!available) {
        setError("Email sudah terdaftar. Silakan gunakan email lain.");
        setEmailError(true);
        setLoading(false);
        return;
      }

      // Pass data to Step 2 via URL params
      router.push({
        pathname: "/auth/profile-setup",
        params: {
          name,
          email,
          password,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memeriksa email. Coba lagi.");
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your journey with NutriScan today.</Text>

        {error ? (
           <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, marginTop: 16 }}>
              <AlertCircle size={20} color="#ef4444" />
              <Text style={{ color: '#ef4444', marginLeft: 8, fontSize: 13 }}>{error}</Text>
           </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="e.g., john_doe"
                placeholderTextColor="#555"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, emailError && { color: '#ef4444' }]}>Email Address</Text>
            <View style={[styles.inputContainer, emailError && styles.inputError]}>
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

          {/* Password Input */}
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
            <View style={styles.passwordHint}>
              <Check size={14} color={isValidPassword ? "#22c55e" : "#555"} />
              <Text style={[styles.hintText, isValidPassword && styles.hintValid]}>
                At least 8 characters
              </Text>
            </View>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkboxBox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Check size={14} color="#000" />}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the <Text style={styles.link}>Terms of Service</Text> and{" "}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? "Creating..." : "Continue"}</Text>
            {!loading && <ArrowRight size={20} color="#000" />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Log In</Text>
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
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2C2C2E",
  },
  progressActive: {
    backgroundColor: "#d3f660",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    marginTop: 32,
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
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#d3f660", // Lime green when typing
  },
  passwordHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
    color: "#555",
  },
  hintValid: {
    color: "#22c55e",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 8,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#d3f660",
    borderColor: "#d3f660",
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: "#888",
    lineHeight: 20,
  },
  link: {
    color: "#d3f660",
    fontWeight: "600",
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
