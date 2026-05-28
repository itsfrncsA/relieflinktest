import 'dart:async';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class ForgotPasswordScreen extends StatefulWidget {
  final String? userName;
  const ForgotPasswordScreen({super.key, this.userName});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final emailController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  // OTP continuous input
  final TextEditingController hiddenOtpController = TextEditingController();
  final FocusNode otpFocusNode = FocusNode();
  String otpValue = "";

  int stepIndex = 0; // 0 = Email, 1 = OTP, 2 = Reset Password
  bool otpSent = false;
  bool otpVerified = false;

  Timer? _timer;
  int _start = 60;

  bool hidePassword = true;
  bool hideConfirmPassword = true;

  @override
  void dispose() {
    _timer?.cancel();
    emailController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    hiddenOtpController.dispose();
    otpFocusNode.dispose();
    super.dispose();
  }

  void startOtpTimer() {
    _start = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_start == 0) {
        timer.cancel();
        setState(() {});
      } else {
        setState(() => _start--);
      }
    });
  }

  void showNotification(String message, {bool success = false}) {
    showDialog(
      context: context,
      builder: (_) => Center(
        child: Material(
          type: MaterialType.transparency,
          child: Container(
            width: 320,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: success ? Colors.green.shade50 : Colors.red.shade50,
              borderRadius: BorderRadius.circular(15),
              border: Border.all(
                color: success ? Colors.green : Colors.red,
                width: 2,
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  success ? Icons.check_circle : Icons.error,
                  color: success ? Colors.green : Colors.red,
                  size: 50,
                ),
                const SizedBox(height: 10),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: success ? Colors.green.shade700 : Colors.red.shade700,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 15),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12)),
                  child: const Text("OK", style: TextStyle(color: Colors.white)),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  void sendOtp() {
    String email = emailController.text.trim();
    if (email.isEmpty ||
        !RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w]{2,4}').hasMatch(email)) {
      showNotification("Enter a valid email");
      return;
    }
    otpSent = true;
    startOtpTimer();
    showNotification("OTP sent to $email", success: true);
    setState(() {
      stepIndex = 1; // Move to OTP step
    });
  }

  void verifyOtp() {
    if (otpValue.length != 6) {
      showNotification("Enter all 6 digits of OTP");
      return;
    }

    // Simulated OTP verification (replace with backend check)
    if (otpValue == "123456") {
      otpVerified = true;
      stepIndex = 2;
      showNotification("OTP verified successfully!", success: true);
      setState(() {});
    } else {
      showNotification("Incorrect OTP, try again");
    }
  }

  void resetPassword() {
    String password = newPasswordController.text;
    String confirm = confirmPasswordController.text;
    

    if (password.isEmpty || confirm.isEmpty) {
      showNotification("Enter and confirm your password");
      return;
    }
    if (password != confirm) {
      showNotification("Passwords do not match");
      return;
    }
    if (password.length < 8 ||
        !RegExp(r'[A-Z]').hasMatch(password) ||
        !RegExp(r'[a-z]').hasMatch(password) ||
        !RegExp(r'\d').hasMatch(password  ) ||
        !RegExp(r'[!@#$%^&*]').hasMatch(password)) {
      showNotification( 
          "Password must be 8+ chars with upper, lower, number & special char");
      return;
    }

    showNotification("Password reset successfully!", success: true);

    // Reset all
    hiddenOtpController.clear();
    otpValue = "";
    emailController.clear();
    newPasswordController.clear();
    confirmPasswordController.clear();
    stepIndex = 0;
    otpSent = false;
    otpVerified = false;
    _timer?.cancel();
    _start = 60;
    setState(() {});
  }

  // ---------------- OTP UI ----------------
  Widget otpInputRow() {
    return GestureDetector(
      onTap: () => otpFocusNode.requestFocus(),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(6, (index) {
              String digit = index < otpValue.length ? otpValue[index] : "";
              return Container(
                width: 40, // smaller box
                height: 40,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: digit.isEmpty
                        ? Colors.grey.shade400
                        : AppColors.primaryColor,
                    width: 2,
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  digit,
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold),
                ),
              );
            }),
          ),
          // Hidden TextField
          SizedBox(
            width: 0,
            height: 0,
            child: TextField(
              focusNode: otpFocusNode,
              controller: hiddenOtpController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              onChanged: (val) {
                setState(() {
                  otpValue = val;
                });
                if (val.length == 6) {
                  verifyOtp();
                }
              },
              decoration: const InputDecoration(
                counterText: "",
                border: InputBorder.none,
                focusedBorder: InputBorder.none,
              ),
              style: const TextStyle(color: Colors.transparent),
              autofocus: true,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Forgot Password"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: IndexedStack(
          index: stepIndex,
          children: [
            // ---------------- Email Step ----------------
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Enter your registered email to receive OTP",
                  style: TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: "Email",
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.email),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: otpSent && _start > 0 ? null : sendOtp,
                      style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentColor),
                      child: Text(
                          otpSent && _start > 0 ? "Wait ($_start s)" : "Send OTP"),
                    ),
                  ],
                ),
              ],
            ),

            // ---------------- OTP Step ----------------
            Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Text("Enter the 6-digit OTP sent to your email",
                    style: TextStyle(fontSize: 16)),
                const SizedBox(height: 20),
                otpInputRow(),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: verifyOtp,
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      padding: const EdgeInsets.symmetric(
                          vertical: 14, horizontal: 50)),
                  child: const Text("Verify OTP",
                      style: TextStyle(color: Colors.white, fontSize: 16)),
                ),
              ],
            ),

            // ---------------- Reset Password Step ----------------
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Set your new password", style: TextStyle(fontSize: 16)),
                const SizedBox(height: 15),
                TextField(
                  controller: newPasswordController,
                  obscureText: hidePassword,
                  decoration: InputDecoration(
                    labelText: "New Password",
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                        icon: Icon(hidePassword
                            ? Icons.visibility_off
                            : Icons.visibility),
                        onPressed: () =>
                            setState(() => hidePassword = !hidePassword)),
                  ),
                ),
                const SizedBox(height: 15),
                TextField(
                  controller: confirmPasswordController,
                  obscureText: hideConfirmPassword,
                  decoration: InputDecoration(
                    labelText: "Confirm Password",
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                        icon: Icon(hideConfirmPassword
                            ? Icons.visibility_off
                            : Icons.visibility),
                        onPressed: () => setState(
                            () => hideConfirmPassword = !hideConfirmPassword)),
                  ),
                ),
                const SizedBox(height: 25),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: resetPassword,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text("Reset Password",
                        style: TextStyle(fontSize: 18, color: Colors.white)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
