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
          'Welcome back${name.isEmpty ? '' : ', $name'}!',
          icon: Icons.check_circle_outline_rounded,
        );

        await Future.delayed(const Duration(milliseconds: 350));

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
          _friendlyError(result['error'] ?? result['message']),
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
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
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
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(22),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 470),
              child: Column(
                children: [
                  Container(
                    width: 82,
                    height: 82,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [
                          AppColors.primaryDark,
                          AppColors.primaryColor,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryColor.withValues(alpha: .18),
                          blurRadius: 25,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.volunteer_activism_rounded,
                      color: Colors.white,
                      size: 42,
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'ReliefLink',
                    style: TextStyle(
                      fontSize: 31,
                      fontWeight: FontWeight.w900,
                      color: AppColors.titleColor,
                    ),
                  ),
                  const SizedBox(height: 5),
                  const Text(
                    'Donation Management System',
                    style: TextStyle(
                      color: AppColors.subtitleColor,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 28),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Form(
                        key: formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Welcome back',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                color: AppColors.titleColor,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Sign in to securely manage and track your donations.',
                              style: TextStyle(
                                color: AppColors.subtitleColor,
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: 24),
                            TextFormField(
                              controller: emailController,
                              keyboardType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              autofillHints: const [AutofillHints.email],
                              decoration: const InputDecoration(
                                labelText: 'Email address',
                                hintText: 'you@example.com',
                                prefixIcon: Icon(Icons.email_outlined),
                              ),
                              validator: (value) {
                                final email = value?.trim() ?? '';
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
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: passwordController,
                              obscureText: obscure,
                              autofillHints: const [AutofillHints.password],
                              onFieldSubmitted: (_) => login(),
                              decoration: InputDecoration(
                                labelText: 'Password',
                                hintText: 'Enter your password',
                                prefixIcon: const Icon(Icons.lock_outline),
                                suffixIcon: IconButton(
                                  onPressed: () =>
                                      setState(() => obscure = !obscure),
                                  icon: Icon(
                                    obscure
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                  ),
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Password is required';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 4),
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: loading
                                    ? null
                                    : () => Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                const ForgotPasswordScreen(),
                                          ),
                                        ),
                                child: const Text('Forgot password?'),
                              ),
                            ),
                            const SizedBox(height: 8),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: loading ? null : login,
                                child: loading
                                    ? const SizedBox(
                                        width: 22,
                                        height: 22,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Text(
                                        'Sign In',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            Row(
                              children: [
                                const Expanded(child: Divider()),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                  ),
                                  child: Text(
                                    'NEW TO RELIEFLINK?',
                                    style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: .7,
                                      color: AppColors.subtitleColor,
                                    ),
                                  ),
                                ),
                                const Expanded(child: Divider()),
                              ],
                            ),
                            const SizedBox(height: 9),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                onPressed: loading
                                    ? null
                                    : () => Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                const RegisterScreen(),
                                          ),
                                        ),
                                child: const Text('Create an account'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Your donations. Your impact. Greater transparency.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.subtitleColor,
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
