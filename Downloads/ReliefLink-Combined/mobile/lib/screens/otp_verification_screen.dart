import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String email;
  const OtpVerificationScreen({super.key, required this.email});

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final TextEditingController otpController = TextEditingController();
  bool isLoading = false;
  int _start = 60;
  bool canResend = false;

  @override
  void initState() {
    super.initState();
    startTimer();
  }


  void startTimer() {
    _start = 60;
    canResend = false;
    Future.delayed(const Duration(seconds: 1), () {
      if (_start > 0) {
        setState(() {
          _start--;
        });
        startTimer();
      } else {
        setState(() {
          canResend = true;
        });
      }
    });
  }

  void sendOtp() async {
    ApiService api = ApiService();
    var result = await api.sendOtp(widget.email);
    if (result['success']) {
      startTimer();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("OTP resent!")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['error'] ?? "Failed to send OTP")),
      );
    }
  }

  void verifyOtp() async {
    String code = otpController.text.trim();

    if (code.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Enter 6-digit code")),
      );
      return;
    }

    setState(() => isLoading = true);

    ApiService api = ApiService();
    var result = await api.verifyOtp(widget.email, code);

    setState(() => isLoading = false);

    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Email verified! Please login"), backgroundColor: Colors.green),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['error'] ?? "Invalid code")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Verify OTP"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Enter verification code",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Text(
              "We sent a code to ${widget.email}",
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            TextField(
              controller: otpController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 24, letterSpacing: 8),
              decoration: InputDecoration(
                hintText: "000000",
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading ? null : verifyOtp,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Verify", style: TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(height: 15),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(canResend ? "Didn't receive code? " : "Resend in $_start seconds"),
                if (canResend)
                  TextButton(
                    onPressed: sendOtp,
                    child: const Text("Resend", style: TextStyle(color: AppColors.primaryColor)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}