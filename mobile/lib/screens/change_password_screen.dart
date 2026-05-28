import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class ChangePasswordScreen extends StatefulWidget {
  final String email;
  
  const ChangePasswordScreen({super.key, required this.email});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final TextEditingController currentPasswordController = TextEditingController();
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();

  bool showCurrent = false;
  bool showNew = false;
  bool showConfirm = false;
  bool isLoading = false;

  void _showDialog(String message, {bool success = false}) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }

  Future<void> updatePassword() async {
    String current = currentPasswordController.text.trim();
    String newPass = newPasswordController.text.trim();
    String confirmPass = confirmPasswordController.text.trim();

    if (current.isEmpty || newPass.isEmpty || confirmPass.isEmpty) {
      _showDialog("All fields are required.");
      return;
    }

    if (newPass != confirmPass) {
      _showDialog("New password and confirm password do not match.");
      return;
    }

    // Password strength validation
    if (newPass.length < 8 ||
        !RegExp(r'[A-Z]').hasMatch(newPass) ||
        !RegExp(r'[a-z]').hasMatch(newPass) ||
        !RegExp(r'\d').hasMatch(newPass) ||
        !RegExp(r'[@$!%*#?&]').hasMatch(newPass)) {
      _showDialog("Password must be at least 8 characters with uppercase, lowercase, number and special character.");
      return;
    }

    setState(() => isLoading = true);

    ApiService api = ApiService();
    var result = await api.changePassword(widget.email, current, newPass);

    setState(() => isLoading = false);

    if (result['success']) {
      _showDialog("Password updated successfully!", success: true);
      
      // Clear fields
      currentPasswordController.clear();
      newPasswordController.clear();
      confirmPasswordController.clear();
      
      // Go back to profile screen after dialog closes
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          Navigator.pop(context);
        }
      });
    } else {
      _showDialog(result['error'] ?? "Password update failed");
    }
  }

  Widget passwordField({
    required String label,
    required TextEditingController controller,
    required bool show,
    required VoidCallback toggleShow,
  }) {
    return TextField(
      controller: controller,
      obscureText: !show,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        prefixIcon: const Icon(Icons.lock),
        suffixIcon: IconButton(
          icon: Icon(show ? Icons.visibility : Icons.visibility_off),
          onPressed: toggleShow,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Change Password"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            passwordField(
              label: "Current Password",
              controller: currentPasswordController,
              show: showCurrent,
              toggleShow: () => setState(() => showCurrent = !showCurrent),
            ),
            const SizedBox(height: 15),
            passwordField(
              label: "New Password",
              controller: newPasswordController,
              show: showNew,
              toggleShow: () => setState(() => showNew = !showNew),
            ),
            const SizedBox(height: 15),
            passwordField(
              label: "Confirm New Password",
              controller: confirmPasswordController,
              show: showConfirm,
              toggleShow: () => setState(() => showConfirm = !showConfirm),
            ),
            const SizedBox(height: 25),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading ? null : updatePassword,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Update Password"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}