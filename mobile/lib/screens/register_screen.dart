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
  final formKey = GlobalKey<FormState>();
  final name = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final confirm = TextEditingController();
  final otp = TextEditingController();

  bool showPassword = false;
  bool showConfirm = false;
  bool privacy = false;
  bool loading = false;
  bool otpLoading = false;

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    password.dispose();
    confirm.dispose();
    otp.dispose();
    super.dispose();
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

    if (lower.contains('already exists') ||
        lower.contains('duplicate') ||
        lower.contains('email already')) {
      return 'An account with this email already exists.';
    }

    if (lower.contains('expired')) {
      return 'This OTP has expired. Please request a new verification code.';
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

  Future<void> register() async {
    if (!(formKey.currentState?.validate() ?? false)) return;

    if (!privacy) {
      _notify(
        'Please review and accept the Data Privacy & User Consent.',
        error: true,
      );
      return;
    }

    FocusScope.of(context).unfocus();
    setState(() => loading = true);

    try {
      final result = await ApiService().sendOtp(email.text.trim());

      if (!mounted) return;
      setState(() => loading = false);

      if (result['success'] == true) {
        _notify(
          'OTP sent. Check your email for the 6-digit verification code.',
        );
        await _showOtpDialog();
      } else {
        _notify(
          _friendlyError(result['error'] ?? result['message']),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
      _notify(
        'Please check your internet connection and try again.',
        error: true,
      );
    }
  }

  Future<void> _showOtpDialog() async {
    otp.clear();

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (dialogContext, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(22),
              ),
              title: const Row(
                children: [
                  Icon(
                    Icons.mark_email_read_outlined,
                    color: AppColors.primaryColor,
                  ),
                  SizedBox(width: 10),
                  Expanded(child: Text('Verify your email')),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      color: AppColors.primaryLight,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.verified_user_outlined,
                      color: AppColors.primaryColor,
                      size: 31,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Enter the 6-digit code sent to\n${email.text.trim()}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.subtitleColor,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 18),
                  TextField(
                    controller: otp,
                    autofocus: true,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 26,
                      letterSpacing: 8,
                      fontWeight: FontWeight.w900,
                      color: AppColors.titleColor,
                    ),
                    decoration: const InputDecoration(
                      hintText: '000000',
                      counterText: '',
                      prefixIcon: Icon(Icons.password_rounded),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: otpLoading
                      ? null
                      : () => Navigator.pop(dialogContext),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: otpLoading
                      ? null
                      : () async {
                          final code = otp.text.trim();

                          if (!RegExp(r'^\d{6}$').hasMatch(code)) {
                            _notify(
                              'Enter the complete 6-digit OTP.',
                              error: true,
                            );
                            return;
                          }

                          setDialogState(() => otpLoading = true);

                          try {
                            final result = await ApiService().verifyOtp(
                              email.text.trim(),
                              code,
                            );

                            if (!mounted) return;

                            setDialogState(() => otpLoading = false);

                            if (result['success'] == true) {
                              Navigator.pop(dialogContext);
                              await _completeRegistration();
                            } else {
                              _notify(
                                _friendlyError(
                                  result['error'] ?? result['message'],
                                ),
                                error: true,
                              );
                            }
                          } catch (_) {
                            if (!mounted) return;
                            setDialogState(() => otpLoading = false);
                            _notify(
                              'Unable to verify the OTP. Please try again.',
                              error: true,
                            );
                          }
                        },
                  child: otpLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Verify & Register'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _completeRegistration() async {
    setState(() => loading = true);

    try {
      final result = await ApiService().register(
        name.text.trim(),
        email.text.trim(),
        password.text,
      );

      if (!mounted) return;
      setState(() => loading = false);

      if (result['success'] == true) {
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
                  'Account Created',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.titleColor,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Your ReliefLink account has been created successfully. You can now sign in.',
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
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (_) => false,
        );
      } else {
        _notify(
          _friendlyError(result['error'] ?? result['message']),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
      _notify(
        'Unable to create your account. Please try again.',
        error: true,
      );
    }
  }

  void _notify(String text, {bool error = false}) {
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

  void _privacyDialog() {
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22),
        ),
        title: const Row(
          children: [
            Icon(
              Icons.privacy_tip_outlined,
              color: AppColors.primaryColor,
            ),
            SizedBox(width: 10),
            Expanded(child: Text('Data Privacy & User Consent')),
          ],
        ),
        content: const SingleChildScrollView(
          child: Text(
            'ReliefLink collects personal information needed to provide account and donation-management services. This may include your full name, email address, phone number, donation details, payment method, transaction/reference information, and uploaded proof of payment.\n\n'
            'The information is used for account management, donation recording and verification, transaction support, reporting, transparency, and other legitimate purposes related to the system.\n\n'
            'Donation and payment information should be handled securely and accessed only by authorized persons. Personal information should not be disclosed except when necessary for legitimate service delivery, legal compliance, or with appropriate consent.\n\n'
            'By continuing with registration, you acknowledge that you have read this notice and consent to the processing of information necessary for ReliefLink. You may request information about your data and exercise applicable privacy rights under relevant Philippine data-protection requirements.\n\n'
            'For this project, the donation-management context is associated with Sto. Domingo Church, 537 Quezon Avenue, Quezon City.',
            style: TextStyle(
              color: AppColors.subtitleColor,
              height: 1.5,
              fontSize: 13,
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          FilledButton(
            onPressed: () {
              setState(() => privacy = true);
              Navigator.pop(context);
            },
            child: const Text('I Agree'),
          ),
        ],
      ),
    );
  }

  InputDecoration _dec(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(title: const Text('Create Account')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 570),
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    const Center(
                      child: Column(
                        children: [
                          Text(
                            'Join ReliefLink',
                            style: TextStyle(
                              fontSize: 29,
                              fontWeight: FontWeight.w900,
                              color: AppColors.titleColor,
                            ),
                          ),
                          SizedBox(height: 6),
                          Text(
                            'Create an account to make and track donations.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.subtitleColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 25),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            TextFormField(
                              controller: name,
                              textCapitalization: TextCapitalization.words,
                              decoration: _dec(
                                'Full name',
                                Icons.person_outline,
                              ),
                              validator: (v) {
                                final value = v?.trim() ?? '';

                                if (value.isEmpty) {
                                  return 'Full name is required';
                                }

                                if (value.length < 2) {
                                  return 'Enter your complete name';
                                }

                                if (!RegExp(r"^[a-zA-ZÀ-ÿ .'-]+$")
                                    .hasMatch(value)) {
                                  return 'Enter a valid name';
                                }

                                return null;
                              },
                            ),
                            const SizedBox(height: 15),
                            TextFormField(
                              controller: email,
                              keyboardType: TextInputType.emailAddress,
                              decoration: _dec(
                                'Email address',
                                Icons.email_outlined,
                              ),
                              validator: (v) {
                                final value = v?.trim() ?? '';

                                if (value.isEmpty) {
                                  return 'Email is required';
                                }

                                if (!RegExp(
                                  r'^[\w.+-]+@[\w-]+\.[\w.-]+$',
                                ).hasMatch(value)) {
                                  return 'Enter a valid email address';
                                }

                                return null;
                              },
                            ),
                            const SizedBox(height: 15),
                            TextFormField(
                              controller: password,
                              obscureText: !showPassword,
                              onChanged: (_) => setState(() {}),
                              decoration: _dec(
                                'Password',
                                Icons.lock_outline,
                              ).copyWith(
                                suffixIcon: IconButton(
                                  onPressed: () => setState(
                                    () => showPassword = !showPassword,
                                  ),
                                  icon: Icon(
                                    showPassword
                                        ? Icons.visibility_outlined
                                        : Icons.visibility_off_outlined,
                                  ),
                                ),
                              ),
                              validator: passwordError,
                            ),
                            const SizedBox(height: 10),
                            _passwordRequirements(),
                            const SizedBox(height: 15),
                            TextFormField(
                              controller: confirm,
                              obscureText: !showConfirm,
                              decoration: _dec(
                                'Confirm password',
                                Icons.lock_outline,
                              ).copyWith(
                                suffixIcon: IconButton(
                                  onPressed: () => setState(
                                    () => showConfirm = !showConfirm,
                                  ),
                                  icon: Icon(
                                    showConfirm
                                        ? Icons.visibility_outlined
                                        : Icons.visibility_off_outlined,
                                  ),
                                ),
                              ),
                              validator: (v) {
                                if ((v ?? '').isEmpty) {
                                  return 'Please confirm your password';
                                }

                                if (v != password.text) {
                                  return 'Passwords do not match';
                                }

                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceBlue,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: AppColors.dividerColor,
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Checkbox(
                                    value: privacy,
                                    onChanged: (value) => setState(
                                      () => privacy = value ?? false,
                                    ),
                                  ),
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.only(top: 12),
                                      child: GestureDetector(
                                        onTap: _privacyDialog,
                                        child: const Text(
                                          'I have read and agree to the Data Privacy & User Consent.',
                                          style: TextStyle(
                                            color: AppColors.primaryColor,
                                            fontWeight: FontWeight.w700,
                                            decoration:
                                                TextDecoration.underline,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: loading ? null : register,
                                icon: loading
                                    ? const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Icon(Icons.person_add_alt_1),
                                label: Text(
                                  loading
                                      ? 'Preparing verification...'
                                      : 'Create Account',
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Center(
                      child: TextButton(
                        onPressed: loading
                            ? null
                            : () => Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const LoginScreen(),
                                  ),
                                ),
                        child: const Text(
                          'Already have an account? Sign in',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _passwordRequirements() {
    final p = password.text;

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
              fontWeight: FontWeight.w800,
              color: AppColors.titleColor,
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
            color:
                valid ? AppColors.successColor : AppColors.subtitleColor,
          ),
          const SizedBox(width: 7),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              color:
                  valid ? AppColors.successColor : AppColors.subtitleColor,
            ),
          ),
        ],
      ),
    );
  }
}
