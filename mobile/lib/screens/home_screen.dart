import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import 'donation_screen.dart';
import 'donation_history_screen.dart';
import 'donation_status_screen.dart';
import 'profile_screen.dart';
import 'about_screen.dart';
import 'transparency_screen.dart';

class HomeScreen extends StatelessWidget {
  final String userName;
  final String email;

  const HomeScreen({super.key, required this.userName, required this.email});

  String capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1);
  }

  String greeting() {
    int hour = DateTime.now().hour;
    String displayName = userName.contains('@')
        ? userName.split('@')[0]
        : userName;
    displayName = capitalize(displayName);
    if (hour < 12) return "Good Morning, $displayName 👋";
    if (hour < 18) return "Good Afternoon, $displayName 👋";
    return "Good Evening, $displayName 👋";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: AppColors.primaryColor,
        title: Row(
          children: [
            Image.asset('assets/images/relieflink_logo.png', height: 40),
            const SizedBox(width: 10),
            const Text(
              "ReliefLink",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              greeting(),
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              "Welcome to ReliefLink. Choose an action below to get started.",
              style: TextStyle(fontSize: 16, color: Colors.black54),
            ),
            const SizedBox(height: 30),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
              mainAxisSpacing: 15,
              crossAxisSpacing: 15,
              childAspectRatio: 1.0,
              children: [
                dashboardCard(
                  context,
                  title: "Make Donation",
                  subtitle: "Start a new donation",
                  icon: Icons.payment,
                  color: AppColors.primaryColor,
                  textColor: Colors.white,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const DonationScreen()),
                  ),
                ),
                dashboardCard(
                  context,
                  title: "Donation Status",
                  subtitle: "Check pending donations",
                  icon: Icons.track_changes,
                  color: Colors.red,
                  textColor: Colors.white,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const DonationStatusScreen()),
                  ),
                ),
                dashboardCard(
                  context,
                  title: "Donation History",
                  subtitle: "View past donations",
                  icon: Icons.history,
                  color: Colors.white,
                  textColor: AppColors.primaryColor,
                  borderColor: AppColors.primaryColor,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const DonationHistoryScreen()),
                  ),
                ),
                dashboardCard(
                  context,
                  title: "Transparency",
                  subtitle: "See donation reports",
                  icon: Icons.fact_check,
                  color: Colors.white,
                  textColor: AppColors.primaryColor,
                  borderColor: AppColors.primaryColor,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const TransparencyScreen()),
                  ),
                ),
                dashboardCard(
                  context,
                  title: "About",
                  subtitle: "Learn about us",
                  icon: Icons.info,
                  color: Colors.white,
                  textColor: AppColors.primaryColor,
                  borderColor: AppColors.primaryColor,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AboutScreen()),
                  ),
                ),
                dashboardCard(
                  context,
                  title: "Profile",
                  subtitle: "Manage your account",
                  icon: Icons.person,
                  color: Colors.white,
                  textColor: AppColors.primaryColor,
                  borderColor: AppColors.primaryColor,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ProfileScreen(
                        userName: userName,
                        email: email,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget dashboardCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required Color textColor,
    Color? borderColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(15),
          border: borderColor != null ? Border.all(color: borderColor) : null,
          boxShadow: const [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 4,
              offset: Offset(2, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: textColor),
            const SizedBox(height: 10),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: textColor.withAlpha(204), // Replaced withOpacity
              ),
            ),
          ],
        ),
      ),
    );
  }
}
  Widget dashboardCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required Color textColor,
    Color? borderColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(15),
          border:
              borderColor != null ? Border.all(color: borderColor) : null,
          boxShadow: const [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 4,
              offset: Offset(2, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: textColor),
            const SizedBox(height: 10),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: textColor.withOpacity(0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }

