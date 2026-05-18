import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import 'login_screen.dart';


class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final TextEditingController fullNameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();
  final TextEditingController otpController = TextEditingController();

  bool showPassword = false;
  bool showConfirmPassword = false;
  bool privacyChecked = false;
  bool isLoading = false;

  void _showMessage(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
      ),
    );
  }

  // Show OTP popup dialog
  Future<void> _showOtpDialog(String email) async {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text("Verify Your Email"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text("Enter the 6-digit OTP sent to:"),
            const SizedBox(height: 5),
            Text(email, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 15),
            TextField(
              controller: otpController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 24, letterSpacing: 8),
              decoration: InputDecoration(
                hintText: "000000",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                counterText: "",
              ),
              autofocus: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              otpController.clear();
              Navigator.pop(context);
            },
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () async {
              String code = otpController.text.trim();
              if (code.length != 6) {
                _showMessage("Enter 6-digit code", isError: true);
                return;
              }

              setState(() => isLoading = true);
              ApiService api = ApiService();
              var result = await api.verifyOtp(email, code);
              setState(() => isLoading = false);

              if (result['success']) {
                otpController.clear();
                Navigator.pop(context); // Close OTP dialog
                _completeRegistration(email); // Proceed to register
              } else {
                _showMessage(result['error'] ?? "Invalid code", isError: true);
              }
            },
            child: const Text("Verify & Register"),
          ),
        ],
      ),
    );
  }

  // Complete registration after OTP verified
  Future<void> _completeRegistration(String email) async {
    String name = fullNameController.text.trim();
    String password = passwordController.text.trim();
    String confirmPassword = confirmPasswordController.text.trim();

    // Validate
    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      _showMessage("Please fill in all fields", isError: true);
      return;
    }

    if (!privacyChecked) {
      _showMessage("Please accept Data Privacy & Terms", isError: true);
      return;
    }

    if (password != confirmPassword) {
      _showMessage("Passwords do not match", isError: true);
      return;
    }

    // Password strength validation
    if (!RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$').hasMatch(password)) {
      _showMessage("Password must be 8+ chars with uppercase, lowercase, number & special char", isError: true);
      return;
    }

    setState(() => isLoading = true);

    ApiService api = ApiService();
    var result = await api.register(name, email, password);

    setState(() => isLoading = false);

    if (result['success']) {
      _showMessage("Registration successful! Please login", isError: false);
      
      // Clear fields
      fullNameController.clear();
      emailController.clear();
      passwordController.clear();
      confirmPasswordController.clear();
      privacyChecked = false;
      
      // Go back to login
      Navigator.pop(context);
    } else {
      _showMessage(result['error'] ?? result['message'] ?? "Registration failed", isError: true);
    }
  }

  // Main button click - Step 1: Send OTP
  Future<void> _onRegisterPressed() async {
    String name = fullNameController.text.trim();
    String email = emailController.text.trim();
    String password = passwordController.text.trim();
    String confirmPassword = confirmPasswordController.text.trim();

    // Basic validation before sending OTP
    if (name.isEmpty || email.isEmpty || password.isEmpty || confirmPassword.isEmpty) {
      _showMessage("Please fill in all fields", isError: true);
      return;
    }

    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}').hasMatch(email)) {
      _showMessage("Enter a valid email address", isError: true);
      return;
    }

    if (password != confirmPassword) {
      _showMessage("Passwords do not match", isError: true);
      return;
    }

    if (!RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$').hasMatch(password)) {
      _showMessage("Password must be 8+ chars with uppercase, lowercase, number & special char", isError: true);
      return;
    }

    if (!privacyChecked) {
      _showMessage("Please accept Data Privacy & Terms", isError: true);
      return;
    }

    setState(() => isLoading = true);

    // Send OTP first
    ApiService api = ApiService();
    var result = await api.sendOtp(email);

    setState(() => isLoading = false);

    if (result['success']) {
      _showMessage("OTP sent to $email", isError: false);
      // Show OTP popup
      _showOtpDialog(email);
    } else {
      _showMessage(result['error'] ?? "Failed to send OTP", isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Register"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Full Name
            TextFormField(
              controller: fullNameController,
              decoration: const InputDecoration(
                labelText: "Full Name",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
            ),
            const SizedBox(height: 15),

            // Email
            TextFormField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: "Email",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
            ),
            const SizedBox(height: 15),

            // Password
            TextFormField(
              controller: passwordController,
              obscureText: !showPassword,
              decoration: InputDecoration(
                labelText: "Password",
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.lock),
                suffixIcon: IconButton(
                  icon: Icon(showPassword ? Icons.visibility : Icons.visibility_off),
                  onPressed: () => setState(() => showPassword = !showPassword),
                ),
              ),
            ),
            const SizedBox(height: 5),

            // Password Rules
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade400),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Password must:"),
                  Text("- Be at least 8 characters"),
                  Text("- Contain uppercase & lowercase"),
                  Text("- Contain a number"),
                  Text("- Contain a special character (!@#\$%^&*)"),
                ],
              ),
            ),
            const SizedBox(height: 15),

            // Confirm Password
            TextFormField(
              controller: confirmPasswordController,
              obscureText: !showConfirmPassword,
              decoration: InputDecoration(
                labelText: "Confirm Password",
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.lock),
                suffixIcon: IconButton(
                  icon: Icon(showConfirmPassword ? Icons.visibility : Icons.visibility_off),
                  onPressed: () => setState(() => showConfirmPassword = !showConfirmPassword),
                ),
              ),
            ),
            const SizedBox(height: 15),

            // Privacy Policy Checkbox
            Row(
              children: [
                Checkbox(
                  value: privacyChecked,
                  onChanged: (value) => setState(() => privacyChecked = value ?? false),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => _showPrivacyDialog(),
                    child: const Text(
                      "I have read and agree to Data Privacy & Terms",
                      style: TextStyle(decoration: TextDecoration.underline, color: Colors.blue),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 25),

            // Single Register Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading ? null : _onRegisterPressed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Register", style: TextStyle(fontSize: 18)),
              ),
            ),
          ],
        ),
      ),
    );
  }

    void _showPrivacyDialog() {
    showDialog(
      context: context,
      builder: (_) => Dialog(
        insetPadding: const EdgeInsets.all(20),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.7,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(15),
                color: AppColors.primaryColor,
                width: double.infinity,
                child: const Text(
                  "Data Privacy & User Consent",
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(15),
                  child: const Text(
                    "By creating an account, you agree to our privacy policy...",
                    style: TextStyle(fontSize: 14, height: 1.5),
                  ),
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Close"),
              ),
              // ✅ Add the Login link here (inside the Column, after TextButton)
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Already have an account? "),
                  GestureDetector(
                    onTap: () {
                      Navigator.pop(context); // Close dialog first
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    },
                    child: const Text(
                      "Login",
                      style: TextStyle(
                        color: AppColors.accentColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }
}