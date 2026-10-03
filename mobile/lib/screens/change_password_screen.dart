import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class ChangePasswordScreen extends StatefulWidget {
  final String email;
  final String userName;

  const ChangePasswordScreen({
    super.key,
    required this.email,
    this.userName = 'ReliefLink User',
  });

  @override
  State<ChangePasswordScreen> createState() =>
      _ChangePasswordScreenState();
}

class _ChangePasswordScreenState
    extends State<ChangePasswordScreen> {
  final formKey = GlobalKey<FormState>();

  final current = TextEditingController();
  final next = TextEditingController();
  final confirm = TextEditingController();

  bool showCurrent = false;
  bool showNext = false;
  bool showConfirm = false;
  bool loading = false;

  @override
  void dispose() {
    current.dispose();
    next.dispose();
    confirm.dispose();
    super.dispose();
  }

  // ------------------------------------------------------------
  // PASSWORD VALIDATION
  // ------------------------------------------------------------

  String? passwordError(String? value) {
    final password = value ?? '';

    if (password.isEmpty) {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Use at least 8 characters';
    }

    if (!RegExp(r'[A-Z]').hasMatch(password)) {
      return 'Add an uppercase letter';
    }

    if (!RegExp(r'[a-z]').hasMatch(password)) {
      return 'Add a lowercase letter';
    }

    if (!RegExp(r'\d').hasMatch(password)) {
      return 'Add a number';
    }

    if (!RegExp(r'[@$!%*#?&]').hasMatch(password)) {
      return 'Add a special character';
    }

    return null;
  }

  // ------------------------------------------------------------
  // PASSWORD STRENGTH
  // ------------------------------------------------------------

  int _passwordScore(String password) {
    if (password.isEmpty) {
      return 0;
    }

    int score = 0;

    if (password.length >= 8) {
      score++;
    }

    if (RegExp(r'[A-Z]').hasMatch(password)) {
      score++;
    }

    if (RegExp(r'[a-z]').hasMatch(password)) {
      score++;
    }

    if (RegExp(r'\d').hasMatch(password)) {
      score++;
    }

    if (RegExp(r'[@$!%*#?&]').hasMatch(password)) {
      score++;
    }

    return score;
  }

  String _strengthText(String password) {
    final score = _passwordScore(password);

    if (score == 0) {
      return '';
    }

    if (score <= 2) {
      return 'Weak';
    }

    if (score <= 4) {
      return 'Good';
    }

    return 'Strong';
  }

  // ------------------------------------------------------------
  // PASSWORD MATCH
  // ------------------------------------------------------------

  bool get _passwordsMatch {
    if (confirm.text.isEmpty) {
      return false;
    }

    return next.text == confirm.text;
  }

  // ------------------------------------------------------------
  // FRIENDLY ERROR
  // ------------------------------------------------------------

  String _friendlyError(dynamic value) {
    final message = value?.toString() ?? '';
    final lower = message.toLowerCase();

    if (lower.contains('socketexception') ||
        lower.contains('connection refused') ||
        lower.contains('failed host lookup') ||
        lower.contains('timeout')) {
      return 'Please check your internet connection and try again.';
    }

    if (lower.contains('incorrect') ||
        lower.contains('invalid current') ||
        lower.contains('current password')) {
      return 'Your current password is incorrect.';
    }

    if (message.contains('Exception:')) {
      return 'Something went wrong. Please try again.';
    }

    return message.isEmpty
        ? 'Unable to update your password. Please try again.'
        : message;
  }

  // ------------------------------------------------------------
  // SAVE PASSWORD
  // ------------------------------------------------------------

  Future<void> save() async {
    if (!(formKey.currentState?.validate() ?? false)) {
      return;
    }

    if (current.text == next.text) {
      _msg(
        'Your new password must be different from your current password.',
        error: true,
      );
      return;
    }

    FocusScope.of(context).unfocus();

    setState(() => loading = true);

    try {
      final result = await ApiService().changePassword(
        widget.email,
        current.text,
        next.text,
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
                  size: 66,
                ),
                SizedBox(height: 12),
                Text(
                  'Password Updated',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.titleColor,
                  ),
                ),
                SizedBox(height: 7),
                Text(
                  'Your account password has been updated successfully.',
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
                child: const Text('Done'),
              ),
            ],
          ),
        );

        if (!mounted) return;

        Navigator.pop(context);
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
        'Unable to update your password. Please try again.',
        error: true,
      );
    }
  }

  // ------------------------------------------------------------
  // MESSAGE
  // ------------------------------------------------------------

  void _msg(
    String text, {
    bool error = false,
  }) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          backgroundColor:
              error
                  ? AppColors.errorColor
                  : AppColors.successColor,
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
                child: Text(text),
              ),
            ],
          ),
        ),
      );
  }

  // ------------------------------------------------------------
  // INPUT DECORATION
  // ------------------------------------------------------------

  InputDecoration _dec(
    String label,
    IconData icon,
    bool visible,
    VoidCallback toggle,
  ) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
      suffixIcon: IconButton(
        onPressed: toggle,
        icon: Icon(
          visible
              ? Icons.visibility_outlined
              : Icons.visibility_off_outlined,
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // BUILD
  // ------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final password = next.text;
    final score = _passwordScore(password);

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,

      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
          ),
          tooltip: 'Back',
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Change Password',
          style: TextStyle(
            fontWeight: FontWeight.w800,
          ),
        ),
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(
          20,
          16,
          20,
          30,
        ),

        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              maxWidth: 560,
            ),

            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(20),

                child: Form(
                  key: formKey,

                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment.start,

                    children: [
                      // ------------------------------------------
                      // CURRENT PASSWORD
                      // ------------------------------------------

                      const Text(
                        'Current password',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: AppColors.titleColor,
                        ),
                      ),

                      const SizedBox(height: 8),

                      TextFormField(
                        controller: current,
                        obscureText: !showCurrent,

                        decoration: _dec(
                          'Enter current password',
                          Icons.lock_outline,
                          showCurrent,
                          () => setState(
                            () => showCurrent =
                                !showCurrent,
                          ),
                        ),

                        validator: (value) =>
                            value == null ||
                                    value.isEmpty
                                ? 'Current password is required'
                                : null,
                      ),

                      const SizedBox(height: 22),

                      // ------------------------------------------
                      // NEW PASSWORD
                      // ------------------------------------------

                      const Text(
                        'New password',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: AppColors.titleColor,
                        ),
                      ),

                      const SizedBox(height: 8),

                      TextFormField(
                        controller: next,
                        obscureText: !showNext,

                        onChanged: (_) =>
                            setState(() {}),

                        decoration: _dec(
                          'Enter new password',
                          Icons.lock_reset_outlined,
                          showNext,
                          () => setState(
                            () => showNext =
                                !showNext,
                          ),
                        ),

                        validator: passwordError,
                      ),

                      const SizedBox(height: 12),

                      // ------------------------------------------
                      // PASSWORD STRENGTH
                      // ------------------------------------------

                      if (password.isNotEmpty)
                        _strengthIndicator(
                          password,
                          score,
                        ),

                      const SizedBox(height: 14),

                      // ------------------------------------------
                      // PASSWORD REQUIREMENTS
                      // ------------------------------------------

                      _requirements(),

                      const SizedBox(height: 20),

                      // ------------------------------------------
                      // CONFIRM PASSWORD
                      // ------------------------------------------

                      const Text(
                        'Confirm new password',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: AppColors.titleColor,
                        ),
                      ),

                      const SizedBox(height: 8),

                      TextFormField(
                        controller: confirm,
                        obscureText: !showConfirm,

                        onChanged: (_) =>
                            setState(() {}),

                        decoration: _dec(
                          'Re-enter new password',
                          Icons.lock_outline,
                          showConfirm,
                          () => setState(
                            () => showConfirm =
                                !showConfirm,
                          ),
                        ),

                        validator: (value) {
                          if (value == null ||
                              value.isEmpty) {
                            return 'Please confirm your password';
                          }

                          if (value != next.text) {
                            return 'Passwords do not match';
                          }

                          return null;
                        },
                      ),

                      const SizedBox(height: 8),

                      // ------------------------------------------
                      // PASSWORD MATCH
                      // ------------------------------------------

                      if (confirm.text.isNotEmpty)
                        Row(
                          children: [
                            Icon(
                              _passwordsMatch
                                  ? Icons.check_circle_rounded
                                  : Icons.error_outline_rounded,
                              size: 16,
                              color: _passwordsMatch
                                  ? AppColors.successColor
                                  : AppColors.errorColor,
                            ),

                            const SizedBox(width: 7),

                            Text(
                              _passwordsMatch
                                  ? 'Passwords match'
                                  : 'Passwords do not match',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight:
                                    FontWeight.w600,
                                color: _passwordsMatch
                                    ? AppColors
                                        .successColor
                                    : AppColors
                                        .errorColor,
                              ),
                            ),
                          ],
                        ),

                      const SizedBox(height: 22),

                      // ------------------------------------------
                      // UPDATE BUTTON
                      // ------------------------------------------

                      SizedBox(
                        width: double.infinity,

                        child:
                            ElevatedButton.icon(
                          onPressed:
                              loading ? null : save,

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
                                  Icons.lock_reset_rounded,
                                ),

                          label: Text(
                            loading
                                ? 'Updating password...'
                                : 'Update Password',
                            style: const TextStyle(
                              fontWeight:
                                  FontWeight.w800,
                            ),
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
      ),
    );
  }

  // ------------------------------------------------------------
  // PASSWORD STRENGTH
  // ------------------------------------------------------------

  Widget _strengthIndicator(
    String password,
    int score,
  ) {
    final strength = _strengthText(password);

    return Row(
      children: [
        Expanded(
          child: Row(
            children: List.generate(
              5,
              (index) {
                final active = index < score;

                return Expanded(
                  child: Container(
                    height: 5,

                    margin: EdgeInsets.only(
                      right:
                          index == 4 ? 0 : 4,
                    ),

                    decoration: BoxDecoration(
                      color: active
                          ? (score >= 5
                              ? AppColors
                                  .successColor
                              : score >= 3
                                  ? AppColors
                                      .primaryColor
                                  : AppColors
                                      .errorColor)
                          : Colors.grey
                              .withOpacity(0.18),

                      borderRadius:
                          BorderRadius.circular(
                        10,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),

        const SizedBox(width: 10),

        Text(
          strength,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w800,
            color: score >= 5
                ? AppColors.successColor
                : score >= 3
                    ? AppColors.primaryColor
                    : AppColors.errorColor,
          ),
        ),
      ],
    );
  }

  // ------------------------------------------------------------
  // PASSWORD REQUIREMENTS
  // ------------------------------------------------------------

  Widget _requirements() {
    final password = next.text;

    return Container(
      width: double.infinity,

      padding: const EdgeInsets.all(13),

      decoration: BoxDecoration(
        color: AppColors.surfaceBlue,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.dividerColor,
        ),
      ),

      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,

        children: [
          const Text(
            'Password requirements',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
              color: AppColors.titleColor,
            ),
          ),

          const SizedBox(height: 8),

          _requirement(
            'At least 8 characters',
            password.length >= 8,
          ),

          _requirement(
            'Uppercase letter',
            RegExp(r'[A-Z]')
                .hasMatch(password),
          ),

          _requirement(
            'Lowercase letter',
            RegExp(r'[a-z]')
                .hasMatch(password),
          ),

          _requirement(
            'Number',
            RegExp(r'\d')
                .hasMatch(password),
          ),

          _requirement(
            'Special character',
            RegExp(r'[@$!%*#?&]')
                .hasMatch(password),
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // REQUIREMENT ITEM
  // ------------------------------------------------------------

  Widget _requirement(
    String text,
    bool valid,
  ) {
    return Padding(
      padding: const EdgeInsets.only(
        bottom: 4,
      ),

      child: Row(
        children: [
          Icon(
            valid
                ? Icons.check_circle_rounded
                : Icons.circle_outlined,
            size: 15,
            color: valid
                ? AppColors.successColor
                : AppColors.subtitleColor,
          ),

          const SizedBox(width: 7),

          Text(
            text,
            style: TextStyle(
              fontSize: 11.5,
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