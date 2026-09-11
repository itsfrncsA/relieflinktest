import 'dart:async';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final email = TextEditingController();
  final otp = TextEditingController();
  final newPass = TextEditingController();
  final confirm = TextEditingController();

  int step = 0;
  int seconds = 0;
  Timer? timer;

  bool loading = false;
  bool showNew = false;
  bool showConfirm = false;

  @override
  void dispose() {
    timer?.cancel();
    email.dispose();
    otp.dispose();
    newPass.dispose();
    confirm.dispose();
    super.dispose();
  }

  void startTimer() {
    timer?.cancel();
    setState(() => seconds = 60);

    timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;

      if (seconds <= 1) {
        t.cancel();
        setState(() => seconds = 0);
      } else {
        setState(() => seconds--);
      }
    });
  }

  String? passwordError(String? value) {
    final p = value ?? '';

    if (p.isEmpty) return 'Password is required';
    if (p.length < 8) return 'Use at least 8 characters';
    if (!RegExp(r'[A-Z]').hasMatch(p)) return 'Add an uppercase letter';
    if (!RegExp(r'[a-z]').hasMatch(p)) return 'Add a lowercase letter';
    if (!RegExp(r'\d').hasMatch(p)) return 'Add a number';
    if (!RegExp(r'[@$!%*#?&]').hasMatch(p)) {
      return 'Add a special character';
    }
    if (RegExp(r'''[<>"':;/|{}\[\]()\-\+= ]''').hasMatch(p)) {
      return 'Cannot contain spaces or forbidden symbols (< > " : ; \' / | { } [ ] ( ) - + =)';
    }

    return null;
  }

  String _friendlyError(dynamic value) {
    final message = value?.toString() ?? '';
    final lower = message.toLowerCase();

    if (lower.contains('socketexception') ||
        lower.contains('connection refused') ||
        lower.contains('failed host lookup') ||
        lower.contains('network is unreachable') ||
        lower.contains('timeout')) {
      return 'Please check your internet connection and try again.';
    }

    if (lower.contains('not found') ||
        lower.contains('no account') ||
        lower.contains('user not found')) {
      return 'No account was found for this email address.';
    }

    if (lower.contains('expired')) {
      return 'This verification code has expired. Please request a new OTP.';
    }

    if (lower.contains('invalid otp') ||
        lower.contains('invalid code') ||
        lower.contains('incorrect otp')) {
      return 'The verification code is invalid. Please check it and try again.';
    }

    if (message.contains('Exception:')) {
      return 'Something went wrong. Please try again.';
    }

    return message.isEmpty
        ? 'We could not complete your request. Please try again.'
        : message;
  }

  void notify(String text, {bool error = false}) {
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

  Future<void> sendOtp() async {
    final value = email.text.trim();

    if (value.isEmpty) {
      notify('Email is required.', error: true);
      return;
    }

    if (!RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$').hasMatch(value)) {
      notify('Enter a valid email address.', error: true);
      return;
    }

    FocusScope.of(context).unfocus();
    setState(() => loading = true);

    try {
      final result = await ApiService().forgotPassword(value);

      if (!mounted) return;
      setState(() => loading = false);

      if (result['success'] == true) {
        setState(() => step = 1);
        startTimer();
        notify('OTP sent. Check your email for the 6-digit code.');
      } else {
        notify(
          _friendlyError(result['error'] ?? result['message']),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
      notify('Please check your internet connection and try again.',
          error: true);
    }
  }

  Future<void> verify() async {
    final code = otp.text.trim();

    if (!RegExp(r'^\d{6}$').hasMatch(code)) {
      notify('Enter the complete 6-digit OTP.', error: true);
      return;
    }

    setState(() => loading = true);

    try {
      final result = await ApiService().verifyResetOtp(
        email.text.trim(),
        code,
      );

      if (!mounted) return;
      setState(() => loading = false);

      if (result['success'] == true) {
        setState(() => step = 2);
        notify('Email verified. Create your new password.');
      } else {
        notify(
          _friendlyError(result['error'] ?? result['message']),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
      notify('Unable to verify the OTP. Please try again.', error: true);
    }
  }

  Future<void> reset() async {
    final p = newPass.text;

    final error = passwordError(p);
    if (error != null) {
      notify(error, error: true);
      return;
    }

    if (p != confirm.text) {
      notify('Passwords do not match.', error: true);
      return;
    }

    setState(() => loading = true);

    try {
      final result = await ApiService().resetPassword(
        email.text.trim(),
        otp.text.trim(),
        p,
      );

      if (!mounted) return;
      setState(() => loading = false);

      if (result['success'] == true) {
        await _showSuccessDialog();
      } else {
        notify(
          _friendlyError(result['error'] ?? result['message']),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
      notify('Unable to reset your password. Please try again.',
          error: true);
    }
  }

  Future<void> _showSuccessDialog() async {
    await showDialog<void>(
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
              size: 68,
            ),
            SizedBox(height: 14),
            Text(
              'Password Reset Successful',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w800,
                color: AppColors.titleColor,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Your password has been updated. You can now sign in with your new password.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.subtitleColor,
                height: 1.45,
              ),
            ),
          ],
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Return to Login'),
          ),
        ],
      ),
    );

    if (!mounted) return;
    Navigator.pop(context);
  }

  String get title {
    if (step == 0) return 'Recover your account';
    if (step == 1) return 'Verify your email';
    return 'Create a new password';
  }

  String get subtitle {
    if (step == 0) {
      return 'Enter your registered email and we will send a secure verification code.';
    }
    if (step == 1) {
      return 'Enter the 6-digit code sent to ${email.text.trim()}.';
    }
    return 'Choose a strong password for your ReliefLink account.';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(title: const Text('Forgot Password')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Column(
                children: [
                  const SizedBox(height: 10),
                  Container(
                    width: 78,
                    height: 78,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Icon(
                      Icons.lock_reset_rounded,
                      size: 40,
                      color: AppColors.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    title,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: AppColors.titleColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    subtitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.subtitleColor,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 26),
                  _progress(),
                  const SizedBox(height: 18),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(22),
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 220),
                        child: _buildStep(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton.icon(
                    onPressed: loading ? null : () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back_rounded, size: 18),
                    label: const Text('Back to Sign In'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _progress() {
    return Row(
      children: [
        _stepDot(0, 'Email'),
        _line(0),
        _stepDot(1, 'OTP'),
        _line(1),
        _stepDot(2, 'Password'),
      ],
    );
  }

  Widget _stepDot(int index, String label) {
    final active = step >= index;

    return Expanded(
      child: Column(
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: active
                  ? AppColors.primaryColor
                  : AppColors.dividerColor,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: active && step > index
                  ? const Icon(Icons.check, color: Colors.white, size: 17)
                  : Text(
                      '${index + 1}',
                      style: TextStyle(
                        color: active
                            ? Colors.white
                            : AppColors.subtitleColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 5),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: AppColors.subtitleColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _line(int index) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 18),
        color: step > index
            ? AppColors.primaryColor
            : AppColors.dividerColor,
      ),
    );
  }

  Widget _buildStep() {
    if (step == 0) {
      return Column(
        key: const ValueKey('email'),
        children: [
          TextField(
            controller: email,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email address',
              prefixIcon: Icon(Icons.email_outlined),
            ),
          ),
          const SizedBox(height: 18),
          _button(
            'Send Verification Code',
            Icons.send_rounded,
            sendOtp,
          ),
        ],
      );
    }

    if (step == 1) {
      return Column(
        key: const ValueKey('otp'),
        children: [
          TextField(
            controller: otp,
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 28,
              letterSpacing: 8,
              fontWeight: FontWeight.w900,
              color: AppColors.titleColor,
            ),
            decoration: const InputDecoration(
              labelText: '6-digit OTP',
              counterText: '',
              prefixIcon: Icon(Icons.verified_user_outlined),
            ),
          ),
          const SizedBox(height: 18),
          _button('Verify Code', Icons.verified_rounded, verify),
          const SizedBox(height: 8),
          TextButton(
            onPressed: seconds > 0 || loading ? null : sendOtp,
            child: Text(
              seconds > 0
                  ? 'Resend available in ${seconds}s'
                  : 'Resend code',
            ),
          ),
        ],
      );
    }

    return Form(
      key: ValueKey('password-form'),
      child: Column(
        key: const ValueKey('password'),
        children: [
          TextFormField(
            controller: newPass,
            obscureText: !showNew,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              labelText: 'New password',
              prefixIcon: const Icon(Icons.lock_outline),
              suffixIcon: IconButton(
                onPressed: () => setState(() => showNew = !showNew),
                icon: Icon(
                  showNew
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                ),
              ),
            ),
            validator: passwordError,
          ),
          const SizedBox(height: 15),
          TextField(
            controller: confirm,
            obscureText: !showConfirm,
            decoration: InputDecoration(
              labelText: 'Confirm new password',
              prefixIcon: const Icon(Icons.lock_outline),
              suffixIcon: IconButton(
                onPressed: () =>
                    setState(() => showConfirm = !showConfirm),
                icon: Icon(
                  showConfirm
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                ),
              ),
            ),
          ),
          const SizedBox(height: 15),
          _passwordChecklist(),
          const SizedBox(height: 18),
          _button('Reset Password', Icons.lock_reset_rounded, reset),
        ],
      ),
    );
  }

  Widget _passwordChecklist() {
    final p = newPass.text;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceBlue,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Password requirements',
            style: TextStyle(
              color: AppColors.titleColor,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          _requirement('At least 8 characters', p.length >= 8),
          _requirement('Uppercase letter', RegExp(r'[A-Z]').hasMatch(p)),
          _requirement('Lowercase letter', RegExp(r'[a-z]').hasMatch(p)),
          _requirement('Number', RegExp(r'\d').hasMatch(p)),
          _requirement(
            'Special character',
            RegExp(r'[@$!%*#?&]').hasMatch(p),
          ),
          _requirement(
            'No spaces or forbidden symbols',
            !RegExp(r'''[<>"':;/|{}\[\]()\-\+= ]''').hasMatch(p),
          ),
        ],
      ),
    );
  }

  Widget _requirement(String text, bool valid) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(
            valid ? Icons.check_circle_rounded : Icons.circle_outlined,
            size: 16,
            color: valid
                ? AppColors.successColor
                : AppColors.subtitleColor,
          ),
          const SizedBox(width: 7),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              color: valid
                  ? AppColors.successColor
                  : AppColors.subtitleColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _button(String label, IconData icon, VoidCallback action) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: loading ? null : action,
        icon: loading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Icon(icon),
        label: Text(label),
      ),
    );
  }
}
