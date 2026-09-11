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
            '1. ACCEPTANCE OF TERMS & INSTITUTIONAL SCOPE\n'
            'By accessing or registering an account on ReliefLink, you agree to be bound by these 15-Section Terms and Conditions and our Data Privacy Policy. ReliefLink operates in partnership with Sto. Domingo Parish (537 Quezon Avenue, Quezon City) to manage transparent disaster relief distribution and donor governance.\n\n'
            '2. USER IDENTITY VERIFICATION & ELIGIBILITY\n'
            'Users must provide truthful, current, and verifiable information including legal name, email, and mobile phone number. Registration using fake identities, temporary emails, or unauthorized pseudonyms is strictly prohibited. Users must be at least 18 years old or legal guardian authorized.\n\n'
            '3. ACCOUNT SECURITY CREDENTIALS & PASSWORD RULES\n'
            'You are responsible for keeping your login credentials confidential. Passwords must meet complexity requirements and cannot contain spaces or forbidden symbols (< > " : ; \' / | { } [ ] ( ) - + =). Notify admins immediately of any security breach.\n\n'
            '4. FIDUCIARY ALLOCATION & RELIEF DONATION INTEGRITY\n'
            'Monetary contributions (via GCash, Maya, Bank Transfer, QR, cash) and in-kind goods are strictly dedicated to Sto. Domingo Parish disaster relief, scholar aid, and community outreach. Operations run on a 100% non-profit humanitarian basis with zero commercial fee deductions.\n\n'
            '5. PROOF OF PAYMENT & FRAUDULENT CLAIMS PROHIBITION\n'
            'Donors must provide authentic reference numbers and valid proof-of-payment receipts. Submitting fake, altered, or duplicate payment screenshots constitutes fraud and results in immediate permanent account termination, IP banning, and reporting under Philippine cybercrime laws.\n\n'
            '6. NON-REFUNDABILITY & IRREVOCABLE FUND COMMITMENT\n'
            'Verified monetary donations are immediately allocated to emergency relief purchasing, food pack assembly, medical aid, or scholar stipends. Consequently, all verified donations are final, irrevocable, and non-refundable.\n\n'
            '7. BLOCKCHAIN AUDIT LOGGING & IMMUTABLE LEDGER\n'
            'ReliefLink incorporates immutable smart contract audit logging (Hyperledger Besu / private Ethereum ledger consensus) for financial transparency. Cryptographic hashes of allocations are recorded on-chain while personal data is protected on local parish servers.\n\n'
            '8. DATA PRIVACY COMPLIANCE (RA 10173)\n'
            'ReliefLink strictly complies with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173). Collected data (name, email, phone, donation history, uploaded receipts) is used solely for legitimate account management, donation verification, and parish reporting. Data is never sold or rented.\n\n'
            '9. DATA ENCRYPTION & SECURITY PROTOCOLS\n'
            'All network communication is encrypted using TLS 1.3 encryption. Passwords are stored using salted cryptographic bcrypt hashing. Administrative API endpoints require JWT authentication tokens with strict role-based access control.\n\n'
            '10. ACCEPTABLE SYSTEM USE & TECHNICAL SAFEGUARDS\n'
            'Users shall not engage in unauthorized administrative access, reverse engineering software binaries, injecting malicious code (SQL/XSS), submitting false relief requests, or transmitting automated spam/bot traffic.\n\n'
            '11. STAFF & ADMINISTRATOR FIDUCIARY STANDARDS\n'
            'Authorized parish coordinators and relief staff accessing administrative dashboards are bound by strict fiduciary duties. Manipulating records or inventory is immutably logged and subject to disciplinary and legal action.\n\n'
            '12. BENEFICIARY VERIFICATION & SECTOR AID GOVERNANCE\n'
            'Aid recipients, scholar stipend applicants, and sector beneficiaries must submit authentic documentation for verification by authorized Sto. Domingo Parish coordinators. Misrepresentation results in immediate aid revocation.\n\n'
            '13. SERVICE DISCLAIMERS & PAYMENT GATEWAY LIMITATIONS\n'
            'ReliefLink operates on a non-profit humanitarian basis. ReliefLink and Sto. Domingo Parish are not liable for service delays caused by telecom ISP outages or third-party payment gateway downtime (e.g., GCash or Maya maintenance).\n\n'
            '14. INTELLECTUAL PROPERTY & SYSTEM OWNERSHIP\n'
            'All software source code, database architectures, UI designs, logos, branding, and parish documentation are exclusive intellectual property of ReliefLink and Sto. Domingo Parish. Unauthorized distribution is prohibited.\n\n'
            '15. AMENDMENTS, GOVERNING LAW & JURISDICTION\n'
            'ReliefLink reserves the right to update these terms at any time. These terms are governed by the laws of the Republic of the Philippines under the exclusive jurisdiction of the proper courts of Quezon City, Metro Manila.\n\n'
            'Contact: Relief Operations Desk, Sto. Domingo Parish, 537 Quezon Avenue, Quezon City, Philippines.',
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