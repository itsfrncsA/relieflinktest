import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  // Example donation images
  final List<String> donationImages = const [
    'assets/images/donation1.png',
    'assets/images/donation2.png',
    'assets/images/donation3.png',
    'assets/images/donation4.png',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold( // ✅ Wrap in Scaffold
      appBar: AppBar(
        title: const Text("About"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Image.asset('assets/images/relieflink_logo.png', height: 100),
            ),
            const SizedBox(height: 20),
            const Text(
              "About ReliefLink",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              "ReliefLink is a donation management platform for humanitarian and social causes. "
              "Our mission is to provide transparency and efficiency in handling donations. "
              "We ensure every donation reaches the intended beneficiaries with full accountability.",
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 20),
            const Text(
              "Past Donations",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            // Grid of donation images
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: donationImages.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
              ),
              itemBuilder: (context, index) {
                return ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.asset(
                    donationImages[index],
                    fit: BoxFit.cover,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
