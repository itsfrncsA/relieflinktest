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
                borderRadius: BorderRadius.circular(24),
              ),
              title: const Text(
                'Verify your email',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  color: AppColors.titleColor,
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.mark_email_read_outlined,
                      color: AppColors.primaryColor,
                      size: 34,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Enter the 6-digit verification code sent to',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.subtitleColor,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    email.text.trim(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 20),
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
                      fillColor: AppColors.surfaceBlue,
                      prefixIcon: const Icon(
                        Icons.password_rounded,
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
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
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
              borderRadius: BorderRadius.circular(22),
            ),
            content: const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(height: 8),
                Icon(
                  Icons.check_circle_rounded,
                  color: AppColors.successColor,
                  size: 70,
                ),
                SizedBox(height: 16),
                Text(
                  'Account Created',
                  style: TextStyle(
                    fontSize: 21,
                    fontWeight: FontWeight.w800,
                    color: AppColors.titleColor,
                  ),
                ),
                SizedBox(height: 9),
                Text(
                  'Your ReliefLink account has been created successfully. You can now sign in.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.subtitleColor,
                    height: 1.45,
                  ),
                ),
                SizedBox(height: 8),
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
        final errMsg = _friendlyError(result['error'] ?? result['message']);
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
                  Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
                  SizedBox(width: 8),
                  Text('Email Already Existing'),
                ],
              ),
              content: const Text(
                'An account with this email address already exists. Please use a different email address or log in.',
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
          _notify(errMsg, error: true);
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

  void _notify(String text, {bool error = false}) {
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
        title: const Text(
          'Terms of Service & Data Privacy Policy',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            color: AppColors.titleColor,
          ),
        ),
        content: const SingleChildScrollView(
          child: Text(
            'TERMS & CONDITIONS AND DATA PRIVACY GOVERNANCE POLICY\n'
            'ReliefLink • Sto. Domingo Parish Partner Hub\n\n'
            '1. ACCEPTANCE OF TERMS, INSTITUTIONAL SCOPE & BINDING AGREEMENT\n'
            'Welcome to ReliefLink, the official community disaster relief governance and donation management system operating in partnership with Sto. Domingo Parish (537 Quezon Avenue, Quezon City, Philippines). By accessing, registering an account, browsing, or utilizing our web and mobile applications, you acknowledge that you have read, understood, and agreed to be legally bound by these 15-Section Terms of Service and Data Privacy Policy. If you do not accept these terms, you must immediately cease all use of the platform.\n\n'
            '2. USER IDENTITY VERIFICATION, AGE ELIGIBILITY & REGISTRATION WARRANTIES\n'
            'Users registering an account on ReliefLink warrant that all registration information submitted—including full legal name, active mobile number, and valid email address—is truthful, current, and verifiable. Registration using fake identities, temporary disposable emails, or unauthorized pseudonyms is strictly prohibited. Registrants must be at least 18 years of age or authorized by a parent or legal guardian to submit monetary contributions or relief assistance applications.\n\n'
            '3. ACCOUNT CREDENTIALS SAFEGUARDS & PASSWORD COMPLEXITY RULES\n'
            'You are solely responsible for maintaining the strict confidentiality of your account credentials (email and password). Passwords must meet security complexity standards (minimum length, uppercase/lowercase letters, numbers, and special symbols) and must NOT contain spaces or forbidden symbols (< > " : ; \' / | { } [ ] ( ) - + =). You agree to notify parish administrators immediately upon discovering any unauthorized account access.\n\n'
            '4. FIDUCIARY FUND ALLOCATION, NON-PROFIT OPERATION & RELIEF GOODS INTEGRITY\n'
            'All monetary contributions made via GCash, Maya, Bank Transfer, QR Ph, or direct cash, as well as in-kind disaster relief goods (canned goods, rice, hygiene kits, medical supplies), are allocated strictly to verified Sto. Domingo Parish calamity response operations, scholar financial aid stipends, and community volunteer apostolates. ReliefLink operates on a 100% non-profit humanitarian basis with zero commercial administrative fee deductions or profit markups.\n\n'
            '5. PROOF OF PAYMENT VERIFICATION, ANTI-FRAUD PROTOCOLS & LEGAL PENALTIES\n'
            'Donors are required to provide authentic transaction reference numbers and valid proof-of-payment receipts. Submitting fake, altered, photoshopped, or duplicate payment screenshots constitutes fraud and is strictly prohibited. Any fraudulent submission will result in immediate permanent account termination, IP address blacklisting, and formal referral to civil and criminal prosecution under the Cybercrime Prevention Act of 2012 (RA 10175) and the Revised Penal Code.\n\n'
            '6. NON-REFUNDABILITY POLICY & IRREVOCABLE DISASTER EMERGENCY COMMITMENTS\n'
            'Monetary donations processed and verified through ReliefLink are committed immediately to real-time emergency relief purchasing, food pack assembly, medical aid deployment, or educational scholar disbursements. Consequently, all verified monetary donations are final, irrevocable, and non-refundable once committed to active relief project channels.\n\n'
            '7. BLOCKCHAIN AUDIT CONSENSUS, SMART CONTRACTS & IMMUTABLE LEDGER\n'
            'ReliefLink implements immutable smart contract transaction logging (Hyperledger Besu / private Ethereum ledger consensus) to guarantee complete financial transparency. Non-sensitive transactional metadata and cryptographic verification hashes are committed on-chain for open public and auditor verification. Sensitive personal information remains strictly protected on secure local parish servers.\n\n'
            '8. DATA PRIVACY COMPLIANCE (REPUBLIC ACT NO. 10173)\n'
            'ReliefLink strictly adheres to the Philippine Data Privacy Act of 2012 (RA 10173). Personal data collected—including donor names, contact details, transaction records, and proof-of-payment receipts—is processed exclusively for legitimate service delivery, donation verification, recipient aid distribution, and parish auditing. Personal data will never be sold, rented, or commercialized under any circumstances.\n\n'
            '9. ADVANCED SECURITY ARCHITECTURE, TLS 1.3 CRYPTOGRAPHY & ACCESS CONTROL\n'
            'All network communication is secured using TLS 1.3 encryption protocols. User passwords are stored using salted cryptographic bcrypt hashing algorithms. Administrative API endpoints require JWT authorization tokens with strict role-based access control (RBAC) enforcing least-privilege principles across all server endpoints.\n\n'
            '10. ACCEPTABLE SYSTEM USE & TECHNICAL SAFEGUARDS\n'
            'Users agree not to engage in any activity that compromises platform integrity, including: (a) attempting unauthorized access to administrative or database endpoints; (b) reverse engineering or decompiling application binaries; (c) injecting malicious scripts (SQL/XSS); (d) submitting false relief requests or fraudulent scholar credentials; or (e) transmitting automated spam or bot traffic.\n\n'
            '11. ADMINISTRATOR FIDUCIARY ACCOUNTABILITY & AUDIT TELEMETRY\n'
            'Parish administrators, relief staff, and volunteer coordinators with access to management dashboards are held to strict fiduciary and ethical standards. Any unauthorized manipulation of relief inventory, scholar stipends, or financial ledger logs is immutably recorded by audit telemetry and subject to immediate administrative disciplinary action and legal recourse.\n\n'
            '12. BENEFICIARY VERIFICATION & SECTOR AID GOVERNANCE\n'
            'Aid recipients, scholar stipend applicants, and sector beneficiaries must submit authentic documentation for verification by authorized Sto. Domingo Parish community coordinators. Misrepresentation of economic status, household income, or calamity displacement results in immediate revocation of aid eligibility.\n\n'
            '13. HUMANITARIAN SERVICE DISCLAIMERS & THIRD-PARTY GATEWAY LIMITATIONS\n'
            'ReliefLink operates on a non-profit humanitarian basis to support disaster-stricken communities. While we strive to maintain uninterrupted service availability, ReliefLink is not liable for temporary service interruptions caused by telecom network outages, scheduled server maintenance, or delays originating from third-party payment channels (such as GCash or financial institution gateways).\n\n'
            '14. INTELLECTUAL PROPERTY RIGHTS & SYSTEM OWNERSHIP\n'
            'All software source code, database architectures, user interface designs, ReliefLink logos, branding assets, and official parish relief documentation are the exclusive intellectual property of ReliefLink and Sto. Domingo Parish. Unauthorized copying, distribution, re-branding, or commercial exploitation is strictly prohibited without explicit written consent.\n\n'
            '15. POLICY AMENDMENTS, GOVERNING LAW & QUEZON CITY JURISDICTION\n'
            'ReliefLink reserves the right to modify or replace these 15-Section Terms of Service at any time. Notice of significant policy updates will be posted within the application. These terms are governed by and construed in accordance with the laws of the Republic of the Philippines. Any legal action or proceeding shall be submitted exclusively to the competent courts of Quezon City, Metro Manila. Official Contact: Relief Operations Desk, Sto. Domingo Parish, 537 Quezon Avenue, Quezon City, Philippines.',
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
      prefixIcon: Icon(
        icon,
        color: AppColors.primaryColor,
      ),
      filled: true,
      fillColor: const Color(0xFFF4F8FD),
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
          Positioned(
            top: -90,
            right: -70,
            child: Container(
              width: 230,
              height: 230,
              decoration: BoxDecoration(
                color: AppColors.primaryColor.withOpacity(0.10),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -100,
            left: -80,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                color: AppColors.primaryColor.withOpacity(0.07),
                shape: BoxShape.circle,
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 25),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 570),
                  child: Form(
                    key: formKey,
                    child: Column(
                      children: [
                        // LOGO
                        Container(
                          width: 88,
                          height: 88,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryColor
                                    .withOpacity(0.14),
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

                        const SizedBox(height: 17),

                        const Text(
                          'ReliefLink',
                          style: TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
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

                        // MAIN CARD
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(26),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.07),
                                blurRadius: 30,
                                offset: const Offset(0, 12),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              // BLUE TOP ACCENT
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
                                  23,
                                ),
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
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
                                      'Join ReliefLink to make and track your donations.',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: AppColors.subtitleColor,
                                        height: 1.4,
                                      ),
                                    ),

                                    const SizedBox(height: 22),

                                    // FULL NAME
                                    TextFormField(
                                      controller: name,
                                      textCapitalization:
                                          TextCapitalization.words,
                                      decoration: _dec(
                                        'Full name',
                                        Icons.person_outline_rounded,
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

                                    // EMAIL
                                    TextFormField(
                                      controller: email,
                                      keyboardType:
                                          TextInputType.emailAddress,
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

                                    // PASSWORD
                                    TextFormField(
                                      controller: password,
                                      obscureText: !showPassword,
                                      onChanged: (_) => setState(() {}),
                                      decoration: _dec(
                                        'Password',
                                        Icons.lock_outline_rounded,
                                      ).copyWith(
                                        suffixIcon: IconButton(
                                          onPressed: () => setState(
                                            () => showPassword =
                                                !showPassword,
                                          ),
                                          icon: Icon(
                                            showPassword
                                                ? Icons.visibility_outlined
                                                : Icons
                                                    .visibility_off_outlined,
                                            color: AppColors.subtitleColor,
                                          ),
                                        ),
                                      ),
                                      validator: passwordError,
                                    ),

                                    const SizedBox(height: 10),

                                    _passwordRequirements(),

                                    const SizedBox(height: 15),

                                    // CONFIRM PASSWORD
                                    TextFormField(
                                      controller: confirm,
                                      obscureText: !showConfirm,
                                      decoration: _dec(
                                        'Confirm password',
                                        Icons.lock_outline_rounded,
                                      ).copyWith(
                                        suffixIcon: IconButton(
                                          onPressed: () => setState(
                                            () => showConfirm =
                                                !showConfirm,
                                          ),
                                          icon: Icon(
                                            showConfirm
                                                ? Icons.visibility_outlined
                                                : Icons
                                                    .visibility_off_outlined,
                                            color: AppColors.subtitleColor,
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

                                    const SizedBox(height: 17),

                                    // PRIVACY
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 8,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF1F7FF),
                                        borderRadius:
                                            BorderRadius.circular(14),
                                        border: Border.all(
                                          color: const Color(0xFFDDEAF7),
                                        ),
                                      ),
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Checkbox(
                                            value: privacy,
                                            activeColor:
                                                AppColors.primaryColor,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(5),
                                            ),
                                            onChanged: (value) => setState(
                                              () => privacy =
                                                  value ?? false,
                                            ),
                                          ),
                                          Expanded(
                                            child: GestureDetector(
                                              onTap: _privacyDialog,
                                              child: const Padding(
                                                padding: EdgeInsets.only(
                                                  top: 11,
                                                  right: 6,
                                                ),
                                                child: Text(
                                                  'I have read and agree to the Data Privacy & User Consent.',
                                                  style: TextStyle(
                                                    fontSize: 12.5,
                                                    height: 1.4,
                                                    color: AppColors
                                                        .primaryColor,
                                                    fontWeight:
                                                        FontWeight.w700,
                                                    decoration:
                                                        TextDecoration
                                                            .underline,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),

                                    const SizedBox(height: 20),

                                    // CREATE ACCOUNT BUTTON
                                    SizedBox(
                                      width: double.infinity,
                                      height: 52,
                                      child: DecoratedBox(
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [
                                              AppColors.primaryColor,
                                              AppColors.primaryColor
                                                  .withOpacity(0.82),
                                            ],
                                            begin: Alignment.centerLeft,
                                            end: Alignment.centerRight,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(14),
                                          boxShadow: [
                                            BoxShadow(
                                              color: AppColors.primaryColor
                                                  .withOpacity(0.22),
                                              blurRadius: 12,
                                              offset: const Offset(0, 6),
                                            ),
                                          ],
                                        ),
                                        child: ElevatedButton(
                                          onPressed:
                                              loading ? null : register,
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor:
                                                Colors.transparent,
                                            shadowColor: Colors.transparent,
                                            disabledBackgroundColor:
                                                Colors.transparent,
                                            foregroundColor: Colors.white,
                                            shape:
                                                RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(14),
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
                                                        color: Colors.white,
                                                      ),
                                                    ),
                                                    SizedBox(width: 10),
                                                    Text(
                                                      'Preparing verification...',
                                                      style: TextStyle(
                                                        fontWeight:
                                                            FontWeight.w700,
                                                      ),
                                                    ),
                                                  ],
                                                )
                                              : const Text(
                                                  'Create Account',
                                                  style: TextStyle(
                                                    fontSize: 15,
                                                    fontWeight:
                                                        FontWeight.w800,
                                                  ),
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

                        // LOGIN
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
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
                                padding: const EdgeInsets.only(left: 5),
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

                        const SizedBox(height: 5),

                        // SMALL TRUST INDICATOR
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 13,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.75),
                            borderRadius: BorderRadius.circular(30),
                            border: Border.all(
                              color: const Color(0xFFE0EAF4),
                            ),
                          ),
                          child: const Text(
                            'Secure donation management',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.subtitleColor,
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
        ],
      ),
    );
  }

  Widget _passwordRequirements() {
    final p = password.text;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F8FD),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFE0EAF4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Password requirements',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: AppColors.titleColor,
            ),
          ),
          const SizedBox(height: 9),
          _requirement(
            'At least 8 characters',
            p.length >= 8,
          ),
          _requirement(
            'Uppercase letter',
            RegExp(r'[A-Z]').hasMatch(p),
          ),
          _requirement(
            'Lowercase letter',
            RegExp(r'[a-z]').hasMatch(p),
          ),
          _requirement(
            'Number',
            RegExp(r'\d').hasMatch(p),
          ),
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
            valid
                ? Icons.check_circle_rounded
                : Icons.circle_outlined,
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
}