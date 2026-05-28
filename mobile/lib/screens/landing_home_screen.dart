import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import 'donation_screen.dart';
import 'donation_history_screen.dart';
import 'donation_status_screen.dart';
import 'profile_screen.dart';
import 'about_screen.dart';
import 'transparency_screen.dart';

class HomeScreen extends StatefulWidget {
  final String userName;
  final String email;

  const HomeScreen({super.key, required this.userName, required this.email});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.primaryColor,
        title: Row(
          children: [
            Image.asset(
              'assets/images/relieflink_logo.png',
              height: 40,
            ),
            const SizedBox(width: 10),
            const Text(
              "ReliefLink",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          const SizedBox(height: 15),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                const SizedBox(width: 10),
                tabButton("HOME", 0),
                const SizedBox(width: 10),
                tabButton("TRANSPARENCY", 1),
                const SizedBox(width: 10),
                tabButton("ABOUT", 2),
                const SizedBox(width: 10),
                tabButton("PROFILE", 3),
                const SizedBox(width: 10),
              ],
            ),
          ),
          const SizedBox(height: 15),
          Expanded(
            child: IndexedStack(
              index: selectedIndex,
              children: [
                DashboardHome(userName: widget.userName, email: widget.email),
                const TransparencyScreen(),
                const AboutScreen(),
                ProfileScreen(userName: widget.userName, email: widget.email),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget tabButton(String title, int index) {
    final bool isSelected = selectedIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          selectedIndex = index;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryColor : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.primaryColor,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}

class DashboardHome extends StatelessWidget {
  final String userName;
  final String email;

  const DashboardHome({super.key, required this.userName, required this.email});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Hi, $userName 👋",
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),
          const Text(
            "Welcome to ReliefLink. Choose an action below to get started.",
            style: TextStyle(fontSize: 16, color: Colors.black54),
          ),
          const SizedBox(height: 30),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            mainAxisSpacing: 15,
            crossAxisSpacing: 15,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              dashboardCard(
                context,
                title: "Make Donation",
                icon: Icons.payment,
                color: Colors.blue.shade50,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const DonationScreen()),
                ),
              ),
              dashboardCard(
                context,
                title: "Donation History",
                icon: Icons.history,
                color: Colors.orange.shade50,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const DonationHistoryScreen()),
                ),
              ),
              dashboardCard(
                context,
                title: "Donation Status",
                icon: Icons.track_changes,
                color: Colors.green.shade50,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const DonationStatusScreen()),
                ),
              ),
              dashboardCard(
                context,
                title: "Transparency",
                icon: Icons.fact_check,
                color: Colors.purple.shade50,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const TransparencyScreen()),
                ),
              ),
              dashboardCard(
                context,
                title: "About",
                icon: Icons.info,
                color: Colors.teal.shade50,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AboutScreen()),
                ),
              ),
              dashboardCard(
                context,
                title: "Profile",
                icon: Icons.person,
                color: Colors.grey.shade200,
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
    );
  }

  Widget dashboardCard(BuildContext context,
      {required String title,
      required IconData icon,
      required Color color,
      required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 4,
              offset: const Offset(2, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: AppColors.primaryColor),
            const SizedBox(height: 15),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}