import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_colors.dart';
import 'login_screen.dart';
import 'home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();

    // Check the saved login session.
    _checkSession();
  }

  Future<void> _checkSession() async {
    try {
      // Keep the splash screen visible for 5 seconds.
      await Future.delayed(const Duration(seconds: 5));

      final prefs = await SharedPreferences.getInstance();

      final token = prefs.getString('auth_token');
      final savedName = prefs.getString('user_name') ?? '';
      final savedEmail = prefs.getString('user_email') ?? '';

      if (!mounted) return;

      // If the user is already logged in, open Home Screen.
      if (token != null && token.isNotEmpty) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => HomeScreen(
              userName: savedName.isNotEmpty
                  ? savedName
                  : (savedEmail.isNotEmpty
                      ? savedEmail.split('@').first
                      : 'User'),
              email: savedEmail,
            ),
          ),
        );
      } else {
        // If there is no saved session, open Login Screen.
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => const LoginScreen(),
          ),
        );
      }
    } catch (_) {
      if (!mounted) return;

      // Open Login Screen if session checking fails.
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const LoginScreen(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // ReliefLink logo
            Image.asset(
              'assets/images/relieflink_logo.png',
              width: 150,
              height: 150,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) {
                return const Icon(
                  Icons.volunteer_activism_rounded,
                  size: 90,
                  color: AppColors.primaryColor,
                );
              },
            ),

            const SizedBox(height: 35),

            // Loading indicator
            const SizedBox(
              width: 30,
              height: 30,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: AppColors.primaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
