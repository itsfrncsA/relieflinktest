import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../constants/app_colors.dart';
import 'change_password_screen.dart';
import 'login_screen.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  final String userName;
  final String email;

  const ProfileScreen({super.key, required this.userName, required this.email});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final TextEditingController nameController = TextEditingController();
  File? profileImage;
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    // Use the passed userName, but if it looks like an email, extract name part
    String displayName = widget.userName;
    if (displayName.contains('@')) {
      displayName = displayName.split('@')[0];
    }
    nameController.text = displayName;
  }

  Future<void> pickProfileImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        profileImage = File(image.path);
      });
    }
  }

  Future<void> updateProfile() async {
    String newName = nameController.text.trim();
    
    if (newName.isEmpty) {
      _showDialog("Name cannot be empty.");
      return;
    }

    setState(() => isLoading = true);

    // Call API to update user profile
    ApiService api = ApiService();
    var result = await api.updateProfile(widget.email, newName);

    setState(() => isLoading = false);

    if (result['success']) {
      _showDialog("Profile updated successfully!", success: true);
      // Update the local state
      // The parent screen will need to be updated, but for now just show success
    } else {
      _showDialog(result['error'] ?? "Update failed");
    }
  }

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

  void logout() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        content: const Text("Are you sure you want to log out?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () async {
              // Clear token
              ApiService api = ApiService();
              await api.clearToken();
              
              Navigator.pop(context);
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
            child: const Text("Logout", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Profile"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Profile Picture
            Stack(
              alignment: Alignment.bottomRight,
              children: [
                CircleAvatar(
                  radius: 60,
                  backgroundColor: AppColors.accentColor.withAlpha(51),
                  backgroundImage: profileImage != null ? FileImage(profileImage!) : null,
                  child: profileImage == null
                      ? Icon(Icons.person, size: 60, color: AppColors.accentColor)
                      : null,
                ),
                GestureDetector(
                  onTap: pickProfileImage,
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primaryColor,
                    child: const Icon(Icons.edit, size: 20, color: Colors.white),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Name Field
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: "Full Name",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
            ),
            const SizedBox(height: 25),

            // Update Profile Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading ? null : updateProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Update Profile"),
              ),
            ),
            const SizedBox(height: 15),

            // Change Password Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ChangePasswordScreen(email: widget.email),
                    ),
                  );
                },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.primaryColor),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text("Change Password", style: TextStyle(color: AppColors.primaryColor)),
              ),
            ),
            const SizedBox(height: 15),

            // Logout Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: logout,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text("Logout"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}