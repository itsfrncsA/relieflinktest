import 'dart:async';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String email;

  const OtpVerificationScreen({
    super.key,
    required this.email,
  });

  @override
  State<OtpVerificationScreen> createState() =>
      _OtpVerificationScreenState();
}

class _OtpVerificationScreenState
    extends State<OtpVerificationScreen> {
  final otp = TextEditingController();

  Timer? timer;
  int seconds = 60;
  bool loading = false;
  bool resending = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    timer?.cancel();
    otp.dispose();
    super.dispose();
  }

  void _startTimer() {
    timer?.cancel();
    setState(() => seconds = 60);

    timer = Timer.periodic(
      const Duration(seconds: 1),
      (t) {
        if (!mounted) return;

        if (seconds <= 1) {
          t.cancel();
          setState(() => seconds = 0);
        } else {
          setState(() => seconds--);
        }
      },
    );
  }

  Future<void> resend() async {
    if (resending || seconds > 0) return;

    setState(() => resending = true);

    try {
      final result =
          await ApiService().sendOtp(widget.email);

      if (!mounted) return;

      setState(() => resending = false);

      if (result['success'] == true) {
        _startTimer();
        _msg('OTP sent. Check your email again.');
      } else {
        _msg(
          _friendlyError(
            result['error'] ?? result['message'],
          ),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;

      setState(() => resending = false);
      _msg(
        'Please check your internet connection and try again.',
        error: true,
      );
    }
  }

  Future<void> verify() async {
    final code = otp.text.trim();

    if (!RegExp(r'^\d{6}$').hasMatch(code)) {
      _msg(
        'Enter the complete 6-digit OTP.',
        error: true,
      );
      return;
    }

    FocusScope.of(context).unfocus();
    setState(() => loading = true);

    try {
      final result = await ApiService().verifyOtp(
        widget.email,
        code,
      );

      if (!mounted) return;

      setState(() => loading = false);

      if (result['success'] == true) {
        await _successDialog();

        if (!mounted) return;

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (_) => const LoginScreen(),
          ),
          (_) => false,
        );
      } else {
        _msg(
          _friendlyError(
            result['error'] ?? result['message'],
          ),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;

      setState(() => loading = false);
      _msg(
        'Unable to verify the OTP. Please try again.',
        error: true,
      );
    }
  }

  String _friendlyError(dynamic value) {
    final message = value?.toString() ?? '';
    final lower = message.toLowerCase();

    if (lower.contains('socketexception') ||
        lower.contains('connection refused') ||
        lower.contains('failed host lookup') ||
        lower.contains('timeout')) {
      return 'Please check your internet connection and try again.';
    }

    if (lower.contains('expired')) {
      return 'This OTP has expired. Please request a new code.';
    }

    if (lower.contains('invalid') ||
        lower.contains('incorrect')) {
      return 'The OTP is invalid. Please check the code and try again.';
    }

    if (message.contains('Exception:')) {
      return 'Something went wrong. Please try again.';
    }

    return message.isEmpty
        ? 'Unable to verify the OTP.'
        : message;
  }

  Future<void> _successDialog() {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.check_circle_rounded,
              color: AppColors.successColor,
              size: 66,
            ),
            SizedBox(height: 12),
            Text(
              'Email Verified',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.titleColor,
              ),
            ),
            SizedBox(height: 7),
            Text(
              'Your email has been successfully verified.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.subtitleColor,
                height: 1.4,
              ),
            ),
          ],
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  void _msg(String text, {bool error = false}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          backgroundColor:
              error ? AppColors.errorColor : AppColors.successColor,
          content: Row(
            children: [
              Icon(
                error
                    ? Icons.error_outline_rounded
                    : Icons.check_circle_outline_rounded,
                color: Colors.white,
              ),
              const SizedBox(width: 10),
              Expanded(child: Text(text)),
            ],
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        title: const Text('Verify Email'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Column(
                children: [
                  const SizedBox(height: 25),
                  Container(
                    width: 82,
                    height: 82,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: const Icon(
                      Icons.mark_email_read_outlined,
                      size: 42,
                      color: AppColors.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Check your email',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 27,
                      fontWeight: FontWeight.w900,
                      color: AppColors.titleColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'We sent a 6-digit verification code to\n${widget.email}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.subtitleColor,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 25),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(22),
                      child: Column(
                        children: [
                          TextField(
                            controller: otp,
                            keyboardType: TextInputType.number,
                            maxLength: 6,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 29,
                              letterSpacing: 8,
                              fontWeight: FontWeight.w900,
                              color: AppColors.titleColor,
                            ),
                            decoration:
                                const InputDecoration(
                              labelText: 'Verification code',
                              hintText: '000000',
                              counterText: '',
                              prefixIcon:
                                  Icon(Icons.password_rounded),
                            ),
                          ),
                          const SizedBox(height: 18),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed:
                                  loading ? null : verify,
                              icon: loading
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child:
                                          CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Icon(
                                      Icons.verified_rounded,
                                    ),
                              label: Text(
                                loading
                                    ? 'Verifying...'
                                    : 'Verify Email',
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          TextButton(
                            onPressed:
                                seconds == 0 &&
                                        !resending &&
                                        !loading
                                    ? resend
                                    : null,
                            child: Text(
                              resending
                                  ? 'Sending...'
                                  : seconds == 0
                                      ? 'Resend code'
                                      : 'Resend in ${seconds}s',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
