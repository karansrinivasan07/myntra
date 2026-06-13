import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, ShoppingBag, CheckCircle } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function Signup() {
  const { Signup } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [isloading, setisloading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ fullName: "", email: "", password: "" });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { fullName: "", email: "", password: "" };
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    try {
      setisloading(true);
      await Signup(formData.fullName, formData.email, formData.password);
      router.replace("/(tabs)");
    } catch (error) {
      setErrors((e) => ({ ...e, email: "Account creation failed. Try again." }));
    } finally {
      setisloading(false);
    }
  };

  const update = (field: keyof typeof formData) => (text: string) => {
    setFormData((f) => ({ ...f, [field]: text }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const FormContent = () => (
    <>
      {/* Logo */}
      <View style={styles.logoRow}>
        <ShoppingBag size={28} color="#ff3f6c" />
        <Text style={styles.logoText}>MYNTRA</Text>
      </View>

      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>
        Join millions of fashion lovers today
      </Text>

      {/* Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={[styles.input, errors.fullName ? styles.inputError : null]}
          placeholder="Jane Doe"
          placeholderTextColor="#aaa"
          value={formData.fullName}
          onChangeText={update("fullName")}
        />
        {!!errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="you@example.com"
          placeholderTextColor="#aaa"
          value={formData.email}
          onChangeText={update("email")}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={[styles.passwordContainer, errors.password ? styles.inputError : null]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Minimum 8 characters"
            placeholderTextColor="#aaa"
            value={formData.password}
            onChangeText={update("password")}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />}
          </TouchableOpacity>
        </View>
        {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.button, isloading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={isloading}
      >
        {isloading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
        )}
      </TouchableOpacity>

      {/* Terms note */}
      <Text style={styles.termsText}>
        By signing up, you agree to our{" "}
        <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
        <Text style={styles.termsLink}>Privacy Policy</Text>
      </Text>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Login Link */}
      <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text style={styles.loginTextBold}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        {/* Left hero panel */}
        <View style={styles.heroPanel}>
          <Image
            source={{
              uri: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Fashion{"\n"}without limits
            </Text>
            <Text style={styles.heroSubtitle}>
              Discover curated styles from top brands.{"\n"}
              New arrivals every day, just for you.
            </Text>
            {/* Perks */}
            <View style={styles.perks}>
              {[
                "Free shipping on your first order",
                "Easy 30-day returns",
                "Exclusive member discounts",
              ].map((perk) => (
                <View key={perk} style={styles.perkRow}>
                  <CheckCircle size={16} color="#ff8fab" />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Right form */}
        <ScrollView
          style={styles.formScrollDesktop}
          contentContainerStyle={styles.formScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormContent />
        </ScrollView>
      </View>
    );
  }

  // Mobile
  return (
    <KeyboardAvoidingView
      style={styles.mobileRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.mobileScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mobileHero}>
          <Image
            source={{
              uri: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.mobileLogoRow}>
            <ShoppingBag size={22} color="#fff" />
            <Text style={styles.mobileLogoText}>MYNTRA</Text>
          </View>
        </View>

        <View style={styles.mobileCard}>
          <FormContent />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  /* ─── Desktop ─── */
  desktopRoot: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  heroPanel: {
    flex: 1,
    position: "relative",
    justifyContent: "flex-end",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  heroContent: {
    padding: 48,
    paddingBottom: 60,
  },
  heroTitle: {
    fontSize: 46,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 54,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 24,
    marginBottom: 32,
  },
  perks: {
    gap: 12,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  perkText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
  },
  formScrollDesktop: {
    width: 480,
    backgroundColor: "#fff",
  },
  formScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 48,
  },
  /* ─── Shared form elements ─── */
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ff3f6c",
    letterSpacing: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: "#f7f7f8",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: "#1a1a1a",
    borderWidth: 1.5,
    borderColor: "#ebebeb",
  },
  inputError: {
    borderColor: "#ff3f6c",
    backgroundColor: "#fff6f8",
  },
  errorText: {
    color: "#ff3f6c",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f8",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#ebebeb",
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#1a1a1a",
  },
  eyeIcon: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  button: {
    backgroundColor: "#ff3f6c",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#ff3f6c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  termsText: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
  termsLink: {
    color: "#ff3f6c",
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ebebeb",
  },
  dividerText: {
    color: "#aaa",
    fontSize: 13,
  },
  loginLink: {
    alignItems: "center",
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginTextBold: {
    color: "#ff3f6c",
    fontWeight: "700",
  },
  /* ─── Mobile layout ─── */
  mobileRoot: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mobileScroll: {
    flexGrow: 1,
  },
  mobileHero: {
    height: 220,
    position: "relative",
    justifyContent: "flex-end",
  },
  mobileLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 20,
  },
  mobileLogoText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  mobileCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: 28,
    paddingTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
});
