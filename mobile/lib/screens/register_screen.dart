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
  // Form controller
  final formKey = GlobalKey<FormState>();

  // Text controllers
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final confirm = TextEditingController();
  final otp = TextEditingController();

  // UI states
  bool showPassword = false;
  bool showConfirm = false;
  bool privacy = false;
  bool loading = false;
  bool otpLoading = false;

  @override
  void dispose() {
    // Dispose controllers when the screen is removed
    firstName.dispose();
    lastName.dispose();
    email.dispose();
    password.dispose();
    confirm.dispose();
    otp.dispose();
    super.dispose();
  }

  // Helper to detect sequential patterns and repeated characters
  bool _hasSequence(String text) {
    if (text.isEmpty) return false;
    final lower = text.toLowerCase();
    const sequences = [
      'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl',
      'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv',
      'uvw', 'vwx', 'wxy', 'xyz',
      'cba', 'fed', 'ihg', 'lkj', 'onm', 'rqp', 'uts', 'zyx',
      '012', '123', '234', '345', '456', '567', '678', '789',
      '987', '876', '765', '654', '543', '432', '321', '210',
      'qwerty', 'asdf', 'zxcv',
    ];
    for (final seq in sequences) {
      if (lower.contains(seq)) return true;
    }
    if (RegExp(r'(.)\1{3,}').hasMatch(lower)) {
      return true;
    }
    return false;
  }

  // Password validation
  String? passwordError(String? value) {
    final p = value ?? '';

    if (p.isEmpty) return 'Password is required';

    if (p.length < 8 || p.length > 30) {
      return 'Contain 8 to 30 characters';
    }

    if (!RegExp(r'[A-Z]').hasMatch(p) || !RegExp(r'[a-z]').hasMatch(p)) {
      return 'Contain both lower and uppercase letters';
    }

    if (!RegExp(r'\d').hasMatch(p)) {
      return 'Contain 1 number';
    }

    if (!RegExp(r'[~!@#$%^&*()_+]').hasMatch(p)) {
      return 'Contain a special character ~!@#\$%^&*()_+';
    }

    if (_hasSequence(p)) {
      return "Cannot contain letter or number sequences like 'abc' '123' '4444' 'qwerty'";
    }

    return null;
  }

  // Makes API errors easier for users to understand
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

  // Starts the registration process
  Future<void> register() async {
    // Check all form fields first
    if (!(formKey.currentState?.validate() ?? false)) return;

    // Make sure the user accepted the privacy policy
    if (!privacy) {
      _notify(
        'Please agree to our Terms and conditions and Privacy policy before creating your account.',
        error: true,
      );
      return;
    }

    FocusScope.of(context).unfocus();

    setState(() => loading = true);

    try {
      // Send OTP to the user's email
      final result = await ApiService().sendOtp(
        email.text.trim(),
      );

      if (!mounted) return;

      setState(() => loading = false);

      if (result['success'] == true) {
        _notify(
          'OTP sent. Check your email for the 6-digit verification code.',
        );

        await _showOtpDialog();
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

      setState(() => loading = false);

      _notify(
        'Please check your internet connection and try again.',
        error: true,
      );
    }
  }

  // Shows the OTP verification dialog
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
                borderRadius: BorderRadius.circular(24),
              ),
              titlePadding: const EdgeInsets.fromLTRB(
                24,
                24,
                24,
                8,
              ),
              contentPadding: const EdgeInsets.fromLTRB(
                24,
                8,
                24,
                8,
              ),
              actionsPadding: const EdgeInsets.fromLTRB(
                16,
                8,
                16,
                16,
              ),
              title: const Text(
                'Verify your email',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  color: AppColors.titleColor,
                  fontSize: 21,
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Email verification icon
                  Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(
                      color: AppColors.primaryLight,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.mark_email_read_outlined,
                      color: AppColors.primaryColor,
                      size: 34,
                    ),
                  ),

                  const SizedBox(height: 18),

                  const Text(
                    'We sent a 6-digit verification code to:',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.subtitleColor,
                      height: 1.4,
                      fontSize: 13,
                    ),
                  ),

                  const SizedBox(height: 6),

                  // User email
                  Text(
                    email.text.trim(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryColor,
                      fontSize: 14,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // OTP input
                  TextField(
                    controller: otp,
                    autofocus: true,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 25,
                      letterSpacing: 8,
                      fontWeight: FontWeight.w900,
                      color: AppColors.titleColor,
                    ),
                    decoration: InputDecoration(
                      hintText: '000000',
                      counterText: '',
                      filled: true,
                      fillColor: const Color(0xFFF4F8FD),
                      prefixIcon: const Icon(
                        Icons.verified_user_outlined,
                        color: AppColors.primaryColor,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none,
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(
                          color: AppColors.primaryColor,
                          width: 1.5,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              actions: [
                // Cancel OTP verification
                TextButton(
                  onPressed: otpLoading
                      ? null
                      : () => Navigator.pop(dialogContext),
                  child: const Text('Cancel'),
                ),

                // Verify OTP
                FilledButton(
                  onPressed: otpLoading
                      ? null
                      : () async {
                          final code = otp.text.trim();

                          // OTP must contain exactly 6 numbers
                          if (!RegExp(r'^\d{6}$').hasMatch(code)) {
                            _notify(
                              'Enter the complete 6-digit OTP.',
                              error: true,
                            );
                            return;
                          }

                          setDialogState(
                            () => otpLoading = true,
                          );

                          try {
                            final result =
                                await ApiService().verifyOtp(
                              email.text.trim(),
                              code,
                            );

                            if (!mounted) return;

                            setDialogState(
                              () => otpLoading = false,
                            );

                            if (result['success'] == true) {
                              if (dialogContext.mounted) {
                                Navigator.pop(dialogContext);
                              }

                              // Complete account creation
                              await _completeRegistration();
                            } else {
                              _notify(
                                _friendlyError(
                                  result['error'] ??
                                      result['message'],
                                ),
                                error: true,
                              );
                            }
                          } catch (_) {
                            if (!mounted) return;

                            setDialogState(
                              () => otpLoading = false,
                            );

                            _notify(
                              'Unable to verify the OTP. Please try again.',
                              error: true,
                            );
                          }
                        },
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: otpLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Verify & Register',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // Creates the account after successful OTP verification
  Future<void> _completeRegistration() async {
    setState(() => loading = true);

    try {
      // Combine first name and last name
      // so the existing backend can still receive one full name.
      final fullName =
          '${firstName.text.trim()} ${lastName.text.trim()}'.trim();

      final result = await ApiService().register(
        fullName,
        email.text.trim(),
        password.text,
      );

      if (!mounted) return;

      setState(() => loading = false);

      if (result['success'] == true) {
        // Account creation success dialog
        await showDialog<void>(
          context: context,
          barrierDismissible: false,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(22),
            ),
            contentPadding: const EdgeInsets.fromLTRB(
              24,
              28,
              24,
              10,
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Success icon
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    color: AppColors.successColor.withValues(
                      alpha: 0.10,
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle_rounded,
                    color: AppColors.successColor,
                    size: 54,
                  ),
                ),

                const SizedBox(height: 18),

                const Text(
                  'Account Created',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.titleColor,
                  ),
                ),

                const SizedBox(height: 9),

                const Text(
                  'Your ReliefLink account has been created successfully. You can now sign in and start using the platform.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.subtitleColor,
                    height: 1.45,
                    fontSize: 13,
                  ),
                ),

                const SizedBox(height: 8),
              ],
            ),
            actions: [
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.pop(context),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    padding: const EdgeInsets.symmetric(
                      vertical: 13,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Return to Login',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );

        if (!mounted) return;

        // Return to login screen
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (_) => const LoginScreen(),
          ),
          (_) => false,
        );
      } else {
        final errMsg = _friendlyError(
          result['error'] ?? result['message'],
        );

        // Handle duplicate email
        if (errMsg.toLowerCase().contains('already exist') ||
            errMsg.toLowerCase().contains('duplicate')) {
          await showDialog<void>(
            context: context,
            builder: (_) => AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: const Row(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    color: Colors.orange,
                    size: 28,
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Email Already Exists',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              content: const Text(
                'An account with this email address already exists. Please use a different email address or sign in to your existing account.',
                style: TextStyle(
                  color: AppColors.subtitleColor,
                  height: 1.45,
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        } else {
          _notify(
            errMsg,
            error: true,
          );
        }
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

  // Shows a snackbar notification
  void _notify(
    String text, {
    bool error = false,
  }) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
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
              Expanded(
                child: Text(
                  text,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
  }

  // Shows the Terms and Data Privacy dialog
  void _privacyDialog() {
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22),
        ),
        titlePadding: const EdgeInsets.fromLTRB(
          24,
          24,
          24,
          8,
        ),
        contentPadding: const EdgeInsets.fromLTRB(
          24,
          8,
          24,
          8,
        ),
        actionsPadding: const EdgeInsets.fromLTRB(
          16,
          8,
          16,
          16,
        ),
        title: const Text(
          'Terms & Data Privacy',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            color: AppColors.titleColor,
            fontSize: 21,
          ),
        ),
        content: const SingleChildScrollView(
          child: Text(
            'RELIEFLINK TERMS OF SERVICE & DATA PRIVACY POLICY\n'
            'Sto. Domingo Parish Partner System\n\n'

            '1. ACCEPTANCE OF TERMS\n'
            'By creating and using a ReliefLink account, you acknowledge that you have read and understood these Terms of Service and Data Privacy Policy. ReliefLink is developed to support donation management and community relief activities in partnership with Sto. Domingo Parish, 537 Quezon Avenue, Quezon City.\n\n'

            '2. ACCOUNT REGISTRATION\n'
            'Users are expected to provide accurate and updated information when creating an account. Your account information should be kept secure and must not be shared with unauthorized individuals.\n\n'

            '3. ACCOUNT SECURITY\n'
            'Users are responsible for maintaining the confidentiality of their email address and password. Please use a strong password and avoid sharing your account credentials with other people.\n\n'

            '4. DONATION MANAGEMENT\n'
            'ReliefLink is designed to support the recording and management of donations intended for verified parish relief and community activities. Donation information may be recorded for monitoring, reporting, and transparency purposes.\n\n'

            '5. ONLINE PAYMENT PROCESSING\n'
            'ReliefLink uses PayMongo as its online payment gateway for processing digital donations. Payment transactions are handled through the PayMongo payment service. Users should review the payment details before confirming a transaction.\n\n'

            '6. PAYMENT CONFIRMATION\n'
            'Donors are not required to upload payment screenshots when completing a donation through the integrated PayMongo payment gateway. The payment status and transaction information provided by the payment service may be used by ReliefLink for donation recording and verification.\n\n'

            '7. DONATION RECORDS\n'
            'Donation information may include the donor name, email address, donation amount, payment method, transaction information, and donation date. These records are used to support proper donation management, reporting, and transparency.\n\n'

            '8. DATA PRIVACY\n'
            'ReliefLink respects the privacy of its users and follows the applicable requirements of the Philippine Data Privacy Act of 2012 (Republic Act No. 10173). Personal information is collected only when necessary for account management, donation processing, verification, reporting, and related system services.\n\n'

            '9. USE OF PERSONAL INFORMATION\n'
            'Personal information will not be sold or used for unrelated commercial purposes. Information may be accessed by authorized personnel when necessary to provide services, manage donations, maintain records, and perform legitimate system operations.\n\n'

            '10. PAYMENT GATEWAY LIMITATIONS\n'
            'Payment processing may be affected by the availability of PayMongo, internet connectivity, banking systems, or other external services. ReliefLink does not control the availability of third-party payment infrastructure.\n\n'

            '11. ACCEPTABLE SYSTEM USE\n'
            'Users must not attempt to gain unauthorized access to the system, manipulate donation records, submit false information, interfere with system operations, or perform activities that may compromise the security or availability of ReliefLink.\n\n'

            '12. SYSTEM SECURITY\n'
            'ReliefLink applies appropriate technical and organizational measures to help protect user information and system records. Access to system functions may be limited according to the user role and authorized permissions.\n\n'

            '13. DONATION TRANSPARENCY\n'
            'Donation records may be used to support reporting, monitoring, and transparency within the ReliefLink system. Selected transaction information may also be recorded through the system\'s blockchain-based transaction logging process.\n\n'

            '14. POLICY UPDATES\n'
            'ReliefLink may update these Terms of Service and Data Privacy Policy when necessary to reflect system improvements, operational changes, or applicable requirements. Users may be informed of significant changes through the application.\n\n'

            '15. GOVERNING LAW & CONTACT\n'
            'These terms are governed by the applicable laws of the Republic of the Philippines. For questions regarding ReliefLink, users may contact the appropriate Relief Operations Desk or authorized representatives of Sto. Domingo Parish at 537 Quezon Avenue, Quezon City.',
            style: TextStyle(
              color: AppColors.subtitleColor,
              height: 1.5,
              fontSize: 13,
            ),
          ),
        ),
        actions: [
          // Close the privacy dialog
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),

          // Accept the privacy policy
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

  // Reusable text field design
  InputDecoration _dec(
    String label,
    IconData icon, {
    String? hint,
  }) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      prefixIcon: Icon(
        icon,
        color: AppColors.primaryColor,
      ),
      filled: true,
      fillColor: const Color(0xFFF6F9FC),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 17,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: Color(0xFFE1EAF4),
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: AppColors.primaryColor,
          width: 1.5,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: AppColors.errorColor,
        ),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: AppColors.errorColor,
          width: 1.5,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F7FD),
      body: Stack(
        children: [
          // Background decorative circle
          Positioned(
            top: -90,
            right: -70,
            child: Container(
              width: 230,
              height: 230,
              decoration: BoxDecoration(
                color: AppColors.primaryColor.withValues(alpha: 0.09),
                shape: BoxShape.circle,
              ),
            ),
          ),

          // Background decorative circle
          Positioned(
            bottom: -100,
            left: -80,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                color: AppColors.primaryColor.withValues(alpha: 0.06),
                shape: BoxShape.circle,
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(
                20,
                24,
                20,
                30,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxWidth: 570,
                  ),
                  child: Form(
                    key: formKey,
                    child: Column(
                      children: [
                        // ============================
                        // RELIEFLINK LOGO
                        // ============================
                        Container(
                          width: 84,
                          height: 84,
                          padding: const EdgeInsets.all(11),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryColor
                                    .withValues(alpha: 0.13),
                                blurRadius: 22,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Image.asset(
                            'assets/images/relieflink_logo.png',
                            cacheWidth: 160,
                            cacheHeight: 160,
                            fit: BoxFit.contain,
                          ),
                        ),

                        const SizedBox(height: 15),

                        const Text(
                          'ReliefLink',
                          style: TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.6,
                            color: AppColors.titleColor,
                          ),
                        ),

                        const SizedBox(height: 4),

                        const Text(
                          'Sto. Domingo Church • Quezon City',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.subtitleColor,
                          ),
                        ),

                        const SizedBox(height: 20),

                        // ============================
                        // MAIN REGISTRATION CARD
                        // ============================
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(26),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.07),
                                blurRadius: 30,
                                offset: const Offset(0, 12),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              // Blue top accent
                              Container(
                                height: 6,
                                decoration: const BoxDecoration(
                                  color: AppColors.primaryColor,
                                  borderRadius: BorderRadius.only(
                                    topLeft: Radius.circular(26),
                                    topRight: Radius.circular(26),
                                  ),
                                ),
                              ),

                              Padding(
                                padding: const EdgeInsets.fromLTRB(
                                  22,
                                  25,
                                  22,
                                  24,
                                ),
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    // Page title
                                    const Text(
                                      'Create your account',
                                      style: TextStyle(
                                        fontSize: 23,
                                        fontWeight: FontWeight.w900,
                                        color: AppColors.titleColor,
                                      ),
                                    ),

                                    const SizedBox(height: 5),

                                    const Text(
                                      'Create your ReliefLink account to manage your profile and donations.',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: AppColors.subtitleColor,
                                        height: 1.45,
                                      ),
                                    ),

                                    const SizedBox(height: 23),

                                    // First name
                                    TextFormField(
                                      controller: firstName,
                                      textCapitalization:
                                          TextCapitalization.words,
                                      decoration: _dec(
                                        'First name',
                                        Icons.person_outline_rounded,
                                      ),
                                      validator: (v) {
                                        final value =
                                            v?.trim() ?? '';

                                        if (value.isEmpty) {
                                          return 'First name is required';
                                        }

                                        if (value.length < 2) {
                                          return 'Enter a valid first name';
                                        }

                                        if (!RegExp(
                                          r"^[a-zA-ZÀ-ÿ .'-]+$",
                                        ).hasMatch(value)) {
                                          return 'Enter a valid name';
                                        }

                                        return null;
                                      },
                                    ),

                                    const SizedBox(height: 15),

                                    // Last name
                                    TextFormField(
                                      controller: lastName,
                                      textCapitalization:
                                          TextCapitalization.words,
                                      decoration: _dec(
                                        'Last name',
                                        Icons.person_outline_rounded,
                                      ),
                                      validator: (v) {
                                        final value =
                                            v?.trim() ?? '';

                                        if (value.isEmpty) {
                                          return 'Last name is required';
                                        }

                                        if (value.length < 2) {
                                          return 'Enter a valid last name';
                                        }

                                        if (!RegExp(
                                          r"^[a-zA-ZÀ-ÿ .'-]+$",
                                        ).hasMatch(value)) {
                                          return 'Enter a valid name';
                                        }

                                        return null;
                                      },
                                    ),

                                    const SizedBox(height: 15),

                                    // Email address
                                    TextFormField(
                                      controller: email,
                                      keyboardType:
                                          TextInputType.emailAddress,
                                      decoration: _dec(
                                        'Email address',
                                        Icons.email_outlined,
                                        hint: 'example@email.com',
                                      ),
                                      validator: (v) {
                                        final value =
                                            v?.trim() ?? '';

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

                                    // Password
                                    TextFormField(
                                      controller: password,
                                      obscureText: !showPassword,
                                      onChanged: (_) => setState(() {}),
                                      decoration: _dec(
                                        'Password',
                                        Icons.lock_outline_rounded,
                                      ).copyWith(
                                        suffixIcon: IconButton(
                                          onPressed: () {
                                            setState(() {
                                              showPassword =
                                                  !showPassword;
                                            });
                                          },
                                          icon: Icon(
                                            showPassword
                                                ? Icons
                                                    .visibility_outlined
                                                : Icons
                                                    .visibility_off_outlined,
                                            color:
                                                AppColors.subtitleColor,
                                          ),
                                        ),
                                      ),
                                      validator: passwordError,
                                    ),

                                    const SizedBox(height: 15),

                                    // Confirm password directly after Password
                                    TextFormField(
                                      controller: confirm,
                                      obscureText: !showConfirm,
                                      decoration: _dec(
                                        'Confirm password',
                                        Icons.lock_outline_rounded,
                                      ).copyWith(
                                        suffixIcon: IconButton(
                                          onPressed: () {
                                            setState(() {
                                              showConfirm =
                                                  !showConfirm;
                                            });
                                          },
                                          icon: Icon(
                                            showConfirm
                                                ? Icons
                                                    .visibility_outlined
                                                : Icons
                                                    .visibility_off_outlined,
                                            color:
                                                AppColors.subtitleColor,
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

                                    const SizedBox(height: 14),

                                    // Password requirements
                                    _passwordRequirements(),

                                    const SizedBox(height: 18),

                                    // Terms & Conditions (unboxed row)
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.center,
                                      children: [
                                        SizedBox(
                                          width: 24,
                                          height: 24,
                                          child: Checkbox(
                                            value: privacy,
                                            activeColor: AppColors.primaryColor,
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            onChanged: (value) {
                                              setState(() {
                                                privacy = value ?? false;
                                              });
                                            },
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: RichText(
                                            text: TextSpan(
                                              style: const TextStyle(
                                                fontSize: 12.5,
                                                color: AppColors.subtitleColor,
                                                height: 1.4,
                                              ),
                                              children: [
                                                const TextSpan(
                                                  text: 'By signing up you agree to our ',
                                                ),
                                                WidgetSpan(
                                                  alignment: PlaceholderAlignment.baseline,
                                                  baseline: TextBaseline.alphabetic,
                                                  child: GestureDetector(
                                                    onTap: _privacyDialog,
                                                    child: const Text(
                                                      'Terms and conditions',
                                                      style: TextStyle(
                                                        color: Color(0xFF4F46E5),
                                                        fontWeight: FontWeight.w600,
                                                        decoration: TextDecoration.underline,
                                                        fontSize: 12.5,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                const TextSpan(
                                                  text: ' and ',
                                                ),
                                                WidgetSpan(
                                                  alignment: PlaceholderAlignment.baseline,
                                                  baseline: TextBaseline.alphabetic,
                                                  child: GestureDetector(
                                                    onTap: _privacyDialog,
                                                    child: const Text(
                                                      'Privacy policy.',
                                                      style: TextStyle(
                                                        color: Color(0xFF4F46E5),
                                                        fontWeight: FontWeight.w600,
                                                        decoration: TextDecoration.underline,
                                                        fontSize: 12.5,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),

                                    const SizedBox(height: 21),

                                    // ============================
                                    // CREATE ACCOUNT BUTTON
                                    // ============================
                                    SizedBox(
                                      width: double.infinity,
                                      height: 53,
                                      child: DecoratedBox(
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [
                                              AppColors.primaryColor,
                                              AppColors.primaryColor
                                                  .withValues(alpha: 0.84),
                                            ],
                                            begin:
                                                Alignment.centerLeft,
                                            end:
                                                Alignment.centerRight,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(14),
                                          boxShadow: [
                                            BoxShadow(
                                              color: AppColors
                                                  .primaryColor
                                                  .withValues(alpha: 0.20),
                                              blurRadius: 13,
                                              offset:
                                                  const Offset(0, 6),
                                            ),
                                          ],
                                        ),
                                        child: ElevatedButton(
                                          onPressed:
                                              loading ? null : register,
                                          style:
                                              ElevatedButton.styleFrom(
                                            backgroundColor:
                                                Colors.transparent,
                                            shadowColor:
                                                Colors.transparent,
                                            disabledBackgroundColor:
                                                Colors.transparent,
                                            foregroundColor:
                                                Colors.white,
                                            shape:
                                                RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(
                                                14,
                                              ),
                                            ),
                                          ),
                                          child: loading
                                              ? const Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .center,
                                                  children: [
                                                    SizedBox(
                                                      width: 19,
                                                      height: 19,
                                                      child:
                                                          CircularProgressIndicator(
                                                        strokeWidth: 2,
                                                        color:
                                                            Colors.white,
                                                      ),
                                                    ),
                                                    SizedBox(width: 10),
                                                    Text(
                                                      'Preparing verification...',
                                                      style: TextStyle(
                                                        fontWeight:
                                                            FontWeight
                                                                .w700,
                                                      ),
                                                    ),
                                                  ],
                                                )
                                              : const Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .center,
                                                  children: [
                                                    Icon(
                                                      Icons
                                                          .person_add_alt_1_rounded,
                                                      size: 19,
                                                    ),
                                                    SizedBox(width: 8),
                                                    Text(
                                                      'Create Account',
                                                      style: TextStyle(
                                                        fontSize: 15,
                                                        fontWeight:
                                                            FontWeight
                                                                .w800,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 18),

                        // ============================
                        // LOGIN LINK
                        // ============================
                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment.center,
                          children: [
                            const Text(
                              'Already have an account?',
                              style: TextStyle(
                                color: AppColors.subtitleColor,
                                fontSize: 13,
                              ),
                            ),
                            TextButton(
                              onPressed: loading
                                  ? null
                                  : () => Navigator.pushReplacement(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              const LoginScreen(),
                                        ),
                                      ),
                              style: TextButton.styleFrom(
                                foregroundColor:
                                    AppColors.primaryColor,
                                padding:
                                    const EdgeInsets.only(left: 5),
                              ),
                              child: const Text(
                                'Sign in',
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 4),

                        // ============================
                        // SECURITY INDICATOR
                        // ============================
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 13,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.75),
                            borderRadius:
                                BorderRadius.circular(30),
                            border: Border.all(
                              color: const Color(0xFFE0EAF4),
                            ),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.verified_user_outlined,
                                size: 14,
                                color: AppColors.primaryColor,
                              ),
                              SizedBox(width: 6),
                              Text(
                                'Secure account registration',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.subtitleColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }


  // Displays the password requirements
  Widget _passwordRequirements() {
    final p = password.text;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAFD),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFE1EAF4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Password must:',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
              color: AppColors.titleColor,
            ),
          ),
          const SizedBox(height: 9),
          _requirement(
            'Contain 8 to 30 characters',
            p.length >= 8 && p.length <= 30,
          ),
          _requirement(
            'Contain both lower and uppercase letters',
            RegExp(r'[a-z]').hasMatch(p) && RegExp(r'[A-Z]').hasMatch(p),
          ),
          _requirement(
            'Contain 1 number',
            RegExp(r'\d').hasMatch(p),
          ),
          _requirement(
            'Contain a special character ~!@#\$%^&*()_+',
            RegExp(r'[~!@#$%^&*()_+]').hasMatch(p),
          ),
          _requirement(
            "Not contain letter or number sequences like 'abc' '123' '4444' 'qwerty'",
            p.isNotEmpty && !_hasSequence(p),
          ),
        ],
      ),
    );
  }

  // Individual password requirement
  Widget _requirement(
    String text,
    bool valid,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(
            valid
                ? Icons.check_circle_rounded
                : Icons.circle_outlined,
            size: 16,
            color: valid
                ? AppColors.successColor
                : AppColors.subtitleColor,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 12,
                color: valid
                    ? const Color(0xFF1E293B)
                    : AppColors.subtitleColor,
                fontWeight:
                    valid ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}