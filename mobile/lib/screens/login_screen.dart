import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import 'home_screen.dart';
import 'forgot_password_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
const LoginScreen({super.key});

@override
State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
final emailController = TextEditingController();
final passwordController = TextEditingController();
final formKey = GlobalKey<FormState>();

bool obscure = true;
bool loading = false;

@override
void dispose() {
emailController.dispose();
passwordController.dispose();
super.dispose();
}

String _friendlyError(dynamic value) {
final message = value?.toString() ?? '';

if (message.isEmpty) {
  return 'We could not sign you in. Please try again.';
}

final lower = message.toLowerCase();

if (lower.contains('socketexception') ||
    lower.contains('connection refused') ||
    lower.contains('failed host lookup') ||
    lower.contains('network is unreachable') ||
    lower.contains('connection reset')) {
  return 'Please check your internet connection and try again.';
}

if (lower.contains('invalid credential') ||
    lower.contains('invalid password') ||
    lower.contains('incorrect password') ||
    lower.contains('user not found') ||
    lower.contains('invalid email') ||
    lower.contains('login failed')) {
  return 'The email or password is incorrect.';
}

if (lower.contains('timeout')) {
  return 'The server is taking too long to respond. Please try again.';
}

if (message.contains('Exception:')) {
  return 'Something went wrong while signing in. Please try again.';
}

return message;


}

Future<void> login() async {
if (!(formKey.currentState?.validate() ?? false)) return;


FocusScope.of(context).unfocus();
setState(() => loading = true);

try {
  final result = await ApiService().login(
    emailController.text.trim(),
    passwordController.text,
  );

  if (!mounted) return;

  setState(() => loading = false);

  if (result['success'] == true) {
    final data = result['data'];
    final user = data is Map ? data['user'] : null;
    final name = user is Map ? (user['name']?.toString() ?? '') : '';

    _notify(
      'Login successful!',
      icon: Icons.check_circle_outline_rounded,
    );

    await Future.delayed(
      const Duration(milliseconds: 350),
    );

    if (!mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (_) => HomeScreen(
          userName: name.isEmpty
              ? emailController.text.split('@').first
              : name,
          email: emailController.text.trim(),
        ),
      ),
      (_) => false,
    );
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
    'Unable to connect. Please check your internet connection and try again.',
    error: true,
  );
}


}

void _notify(
String text, {
bool error = false,
IconData? icon,
}) {
if (!mounted) return;
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
icon ??
(error
? Icons.error_outline_rounded
: Icons.check_circle_outline_rounded),
color: Colors.white,
),
const SizedBox(width: 10),
Expanded(
child: Text(text),
),
],
),
),
);
}

InputDecoration _inputDecoration({
required String label,
required String hint,
required IconData icon,
}) {
return InputDecoration(
labelText: label,
hintText: hint,
prefixIcon: Icon(
icon,
size: 21,
color: AppColors.primaryColor,
),
filled: true,
fillColor: const Color(0xFFF5F9FF),
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
borderSide: BorderSide(
color: const Color(0xFFDCE8F8),
width: 1,
),
),
focusedBorder: OutlineInputBorder(
borderRadius: BorderRadius.circular(14),
borderSide: BorderSide(
color: AppColors.primaryColor,
width: 1.6,
),
),
errorBorder: OutlineInputBorder(
borderRadius: BorderRadius.circular(14),
borderSide: BorderSide(
color: AppColors.errorColor,
width: 1,
),
),
focusedErrorBorder: OutlineInputBorder(
borderRadius: BorderRadius.circular(14),
borderSide: BorderSide(
color: AppColors.errorColor,
width: 1.5,
),
),
);
}

@override
Widget build(BuildContext context) {
final screenWidth = MediaQuery.of(context).size.width;
final isWide = screenWidth >= 800;


return Scaffold(
  backgroundColor: const Color(0xFFF3F8FE),
  body: SafeArea(
    child: Stack(
      children: [
        // ==========================================
        // BACKGROUND DECORATION
        // ==========================================

        Positioned(
          top: -130,
          right: -90,
          child: Container(
            width: 310,
            height: 310,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primaryColor.withValues(
                alpha: 0.09,
              ),
            ),
          ),
        ),

        Positioned(
          top: 100,
          left: -160,
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primaryColor.withValues(
                alpha: 0.045,
              ),
            ),
          ),
        ),

        Positioned(
          bottom: -150,
          right: -100,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primaryColor.withValues(
                alpha: 0.055,
              ),
            ),
          ),
        ),

        // ==========================================
        // MAIN CONTENT
        // ==========================================

        Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: isWide ? 32 : 20,
              vertical: 28,
            ),
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: 470,
              ),
              child: Column(
                children: [
                  // ======================================
                  // LOGO
                  // ======================================

                  Container(
                    width: isWide ? 145 : 125,
                    height: isWide ? 145 : 125,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryColor.withValues(
                            alpha: 0.14,
                          ),
                          blurRadius: 28,
                          offset: const Offset(0, 12),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(12),
                    child: Image.asset(
                      'assets/images/relieflink_logo.png',
                      cacheWidth: 160,
                      cacheHeight: 160,
                      fit: BoxFit.contain,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ======================================
                  // APP NAME
                  // ======================================

                  const Text(
                    'ReliefLink',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 31,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.7,
                      color: AppColors.titleColor,
                    ),
                  ),

                  const SizedBox(height: 5),

                  // ======================================
                  // CHURCH
                  // ======================================

                  const Text(
                    'Sto. Domingo Church • Quezon City',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.subtitleColor,
                    ),
                  ),

                  const SizedBox(height: 30),

                  // ======================================
                  // LOGIN CARD
                  // ======================================

                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: Colors.white,
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryColor.withValues(
                            alpha: 0.10,
                          ),
                          blurRadius: 35,
                          offset: const Offset(0, 15),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        // ==================================
                        // CARD TOP ACCENT
                        // ==================================

                        Container(
                          width: double.infinity,
                          height: 6,
                          decoration: BoxDecoration(
                            color: AppColors.primaryColor,
                            borderRadius:
                                const BorderRadius.vertical(
                              top: Radius.circular(24),
                            ),
                          ),
                        ),

                        Padding(
                          padding: const EdgeInsets.fromLTRB(
                            26,
                            27,
                            26,
                            26,
                          ),
                          child: Form(
                            key: formKey,
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                // ==============================
                                // TITLE
                                // ==============================

                                const Text(
                                  'Sign in',
                                  style: TextStyle(
                                    fontSize: 25,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.titleColor,
                                  ),
                                ),

                                const SizedBox(height: 7),

                                const Text(
                                  'Access your donation account and manage your contributions.',
                                  style: TextStyle(
                                    fontSize: 13.5,
                                    height: 1.5,
                                    color:
                                        AppColors.subtitleColor,
                                  ),
                                ),

                                const SizedBox(height: 25),

                                // ==============================
                                // EMAIL
                                // ==============================

                                TextFormField(
                                  controller: emailController,
                                  keyboardType:
                                      TextInputType.emailAddress,
                                  textInputAction:
                                      TextInputAction.next,
                                  autofillHints: const [
                                    AutofillHints.email,
                                  ],
                                  decoration: _inputDecoration(
                                    label: 'Email address',
                                    hint: 'you@example.com',
                                    icon:
                                        Icons.email_outlined,
                                  ),
                                  validator: (value) {
                                    final email =
                                        value?.trim() ?? '';

                                    if (email.isEmpty) {
                                      return 'Email is required';
                                    }

                                    if (!RegExp(
                                      r'^[\w.+-]+@[\w-]+\.[\w.-]+$',
                                    ).hasMatch(email)) {
                                      return 'Enter a valid email address';
                                    }

                                    return null;
                                  },
                                ),

                                const SizedBox(height: 17),

                                // ==============================
                                // PASSWORD
                                // ==============================

                                TextFormField(
                                  controller: passwordController,
                                  obscureText: obscure,
                                  autofillHints: const [
                                    AutofillHints.password,
                                  ],
                                  onFieldSubmitted: (_) => login(),
                                  decoration: _inputDecoration(
                                    label: 'Password',
                                    hint: 'Enter your password',
                                    icon: Icons
                                        .lock_outline_rounded,
                                  ).copyWith(
                                    suffixIcon: IconButton(
                                      tooltip: obscure
                                          ? 'Show password'
                                          : 'Hide password',
                                      onPressed: () {
                                        setState(() {
                                          obscure = !obscure;
                                        });
                                      },
                                      icon: Icon(
                                        obscure
                                            ? Icons
                                                .visibility_off_outlined
                                            : Icons
                                                .visibility_outlined,
                                        size: 21,
                                        color: AppColors
                                            .subtitleColor,
                                      ),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null ||
                                        value.isEmpty) {
                                      return 'Password is required';
                                    }

                                    return null;
                                  },
                                ),

                                const SizedBox(height: 4),

                                // ==============================
                                // FORGOT PASSWORD
                                // ==============================

                                Align(
                                  alignment:
                                      Alignment.centerRight,
                                  child: TextButton(
                                    style: TextButton.styleFrom(
                                      padding:
                                          const EdgeInsets
                                              .symmetric(
                                        horizontal: 4,
                                        vertical: 8,
                                      ),
                                    ),
                                    onPressed: loading
                                        ? null
                                        : () => Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (_) =>
                                                    const ForgotPasswordScreen(),
                                              ),
                                            ),
                                    child: const Text(
                                      'Forgot password?',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight:
                                            FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ),

                                const SizedBox(height: 11),

                                // ==============================
                                // SIGN IN BUTTON
                                // ==============================

                                SizedBox(
                                  width: double.infinity,
                                  height: 55,
                                  child: DecoratedBox(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          AppColors.primaryColor,
                                          AppColors.primaryColor
                                              .withValues(
                                            alpha: 0.82,
                                          ),
                                        ],
                                        begin:
                                            Alignment.centerLeft,
                                        end:
                                            Alignment.centerRight,
                                      ),
                                      borderRadius:
                                          BorderRadius.circular(
                                        14,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors
                                              .primaryColor
                                              .withValues(
                                            alpha: 0.25,
                                          ),
                                          blurRadius: 14,
                                          offset:
                                              const Offset(0, 7),
                                        ),
                                      ],
                                    ),
                                    child: ElevatedButton(
                                      onPressed: loading
                                          ? null
                                          : login,
                                      style: ElevatedButton
                                          .styleFrom(
                                        backgroundColor:
                                            Colors.transparent,
                                        foregroundColor:
                                            Colors.white,
                                        disabledBackgroundColor:
                                            Colors.transparent,
                                        shadowColor:
                                            Colors.transparent,
                                        elevation: 0,
                                        shape:
                                            RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(
                                            14,
                                          ),
                                        ),
                                      ),
                                      child: loading
                                          ? const SizedBox(
                                              width: 22,
                                              height: 22,
                                              child:
                                                  CircularProgressIndicator(
                                                strokeWidth: 2.2,
                                                color: Colors.white,
                                              ),
                                            )
                                          : const Text(
                                              'Sign In',
                                              style: TextStyle(
                                                fontSize: 15.5,
                                                fontWeight:
                                                    FontWeight.w800,
                                              ),
                                            ),
                                    ),
                                  ),
                                ),

                                const SizedBox(height: 26),

                                // ==============================
                                // REGISTER DIVIDER
                                // ==============================

                                Row(
                                  children: [
                                    Expanded(
                                      child: Divider(
                                        color:
                                            Colors.grey.shade200,
                                      ),
                                    ),
                                    Padding(
                                      padding:
                                          const EdgeInsets
                                              .symmetric(
                                        horizontal: 12,
                                      ),
                                      child: Text(
                                        'NEW TO RELIEFLINK?',
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight:
                                              FontWeight.w800,
                                          letterSpacing: 0.8,
                                          color: Colors
                                              .grey.shade500,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Divider(
                                        color:
                                            Colors.grey.shade200,
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: 15),

                                // ==============================
                                // CREATE ACCOUNT
                                // ==============================

                                SizedBox(
                                  width: double.infinity,
                                  height: 50,
                                  child: OutlinedButton(
                                    onPressed: loading
                                        ? null
                                        : () =>
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (_) =>
                                                    const RegisterScreen(),
                                              ),
                                            ),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor:
                                          AppColors.primaryColor,
                                      side: BorderSide(
                                        color: AppColors
                                            .primaryColor
                                            .withValues(
                                          alpha: 0.35,
                                        ),
                                        width: 1.2,
                                      ),
                                      shape:
                                          RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(
                                          14,
                                        ),
                                      ),
                                    ),
                                    child: const Text(
                                      'Create an account',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight:
                                            FontWeight.w700,
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
                  ),

                  const SizedBox(height: 21),

                  // ==========================================
                  // SECURITY
                  // ==========================================

                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 15,
                      vertical: 9,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(
                        alpha: 0.75,
                      ),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(
                        color: AppColors.primaryColor.withValues(
                          alpha: 0.08,
                        ),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.verified_user_outlined,
                          size: 14,
                          color: AppColors.primaryColor,
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          'Secure donation management',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.subtitleColor,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 9),

                  const Text(
                    'Your donations. Your impact. Greater transparency.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 10.5,
                      color: AppColors.subtitleColor,
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
);

}
}
