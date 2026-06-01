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
  final TextEditingController phoneController = TextEditingController();

  File? profileImage;
  bool isLoading = false;

  // User data
  String? userId;
  String? joinDate;
  double totalDonations = 0.0;
  int donationCount = 0;
  String? status;

  @override
  void initState() {
    super.initState();
    String displayName = widget.userName;
    if (displayName.contains('@')) {
      displayName = displayName.split('@')[0];
    }
    nameController.text = displayName;
    phoneController.text = "";

    // Initialize other fields with default values
    userId = "—";
    joinDate = "—";
    status = "—";

    // Load user data from database
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    ApiService api = ApiService();
    try {
      var result = await api.getUserProfile();
      if (result['success'] && result['data'] != null) {
        final userData = result['data'];
        setState(() {
          // Get user ID
          userId = userData['_id'] ?? userData['id'] ?? "—";

          // Get join date from createdAt
          if (userData['createdAt'] != null) {
            DateTime createdDate = DateTime.parse(userData['createdAt']);
            joinDate =
                "${createdDate.year}-${createdDate.month.toString().padLeft(2, '0')}-${createdDate.day.toString().padLeft(2, '0')}";
          } else {
            joinDate = "—";
          }

          // Get donation count and total amount
          donationCount = userData['totalDonations'] ?? 0;
          totalDonations = (userData['totalDonationAmount'] ?? 0).toDouble();

          // Get status
          status = userData['status'] ?? "—";

          // Get phone number if available
          if (userData['phoneNumber'] != null &&
              userData['phoneNumber'].isNotEmpty) {
            phoneController.text = userData['phoneNumber'];
          }
        });
      } else {
        print("Error loading profile: ${result['error'] ?? 'Unknown error'}");
      }
    } catch (e) {
      print("Error loading user data: $e");
    }
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

    ApiService api = ApiService();
    var result = await api.updateProfile(widget.email, newName);

    setState(() => isLoading = false);

    if (!mounted) return;

    if (result['success']) {
      _showDialog("Profile updated successfully!", success: true);
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

  void _deleteAccount() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Delete Account"),
        content: const Text(
            "Are you sure you want to delete your account? This action cannot be undone."),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () async {
              // TODO: Implement delete account API call
              Navigator.pop(context);
              _showDialog("Account deletion not yet implemented");
            },
            child: const Text("Delete", style: TextStyle(color: Colors.red)),
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
              ApiService api = ApiService();
              await api.clearToken();

              if (!mounted) return;
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
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile Header Card
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.primaryColor,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(20),
                  bottomRight: Radius.circular(20),
                ),
              ),
              padding: const EdgeInsets.symmetric(vertical: 30),
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      CircleAvatar(
                        radius: 55,
                        backgroundColor: Colors.white,
                        backgroundImage: profileImage != null
                            ? FileImage(profileImage!)
                            : null,
                        child: profileImage == null
                            ? const Icon(Icons.person,
                                size: 55, color: AppColors.primaryColor)
                            : null,
                      ),
                      GestureDetector(
                        onTap: pickProfileImage,
                        child: Container(
                          decoration: const BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                          ),
                          padding: const EdgeInsets.all(8),
                          child: const Icon(Icons.edit,
                              size: 18, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    "Welcome back",
                    style: TextStyle(
                        color: Colors.white.withAlpha(179), fontSize: 14),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    nameController.text.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    widget.email,
                    style: TextStyle(
                        color: Colors.white.withAlpha(179), fontSize: 14),
                  ),
                ],
              ),
            ),

            // Account Details Section
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Account details",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),

                  // User ID
                  _buildDetailRow(
                      Icons.card_giftcard, "User Id", userId ?? "—", null),

                  // Email
                  _buildDetailRow(Icons.email, "Email", widget.email, null),

                  // Full Name (Editable)
                  _buildDetailRow(
                      Icons.person, "Full Name", null, nameController),

                  // Phone Number (Editable)
                  _buildDetailRow(
                      Icons.phone, "Phone Number", null, phoneController),

                  // Join Date
                  _buildDetailRow(
                      Icons.calendar_today, "Join Date", joinDate ?? "—", null),

                  // Total Donations
                  _buildDetailRow(
                      Icons.account_balance_wallet,
                      "Total Donations",
                      "₱${totalDonations.toStringAsFixed(2)}",
                      null),

                  // Donation Count
                  _buildDetailRow(Icons.history, "Donation Count",
                      donationCount.toString(), null),

                  // Status
                  _buildDetailRow(
                      Icons.check_circle, "Status", status ?? "—", null),

                  const SizedBox(height: 30),

                  // Save Changes Button
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
                          : const Text("Save Changes"),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Change Password Button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                ChangePasswordScreen(email: widget.email),
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.primaryColor),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text(
                        "Change Password",
                        style: TextStyle(color: AppColors.primaryColor),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Delete Account Button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: _deleteAccount,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.red),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text(
                        "Delete Account",
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

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
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    IconData icon,
    String label,
    String? value,
    TextEditingController? controller,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      margin: const EdgeInsets.only(bottom: 1),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        border: Border(
          bottom: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 20, color: AppColors.primaryColor),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 4),
                if (controller != null)
                  SizedBox(
                    height: 24,
                    child: TextField(
                      controller: controller,
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                        isDense: true,
                        hintText: "—",
                      ),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  )
                else
                  Text(
                    value ?? "—",
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
              ],
            ),
          ),
          if (controller != null)
            Icon(Icons.edit, size: 18, color: AppColors.primaryColor),
        ],
      ),
    );
  }
}
