import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import '../screens/home_screen.dart';
import '../screens/donation_screen.dart';
import '../screens/donation_history_screen.dart';
import '../screens/announcements_screen.dart';
import '../screens/transparency_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/about_screen.dart';
import '../screens/login_screen.dart';

class AppDrawer extends StatelessWidget {
  final String userName;
  final String email;

  const AppDrawer({
    super.key,
    required this.userName,
    required this.email,
  });

  void _go(BuildContext context, Widget page) {
    final nav = Navigator.of(context);
    nav.pop();
    nav.pushReplacement(
      MaterialPageRoute(builder: (_) => page),
    );
  }

  Future<void> _logout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.logout_rounded, color: AppColors.errorColor),
            SizedBox(width: 10),
            Text('Log out?'),
          ],
        ),
        content: const Text(
          'Are you sure you want to log out of ReliefLink?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.errorColor,
            ),
            onPressed: () => Navigator.pop(dialogCtx, true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      final nav = Navigator.of(context);
      nav.pop();
      await ApiService().clearToken();

      nav.pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (_) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final displayName =
        userName.trim().isEmpty ? 'ReliefLink User' : userName.trim();

    return Drawer(
      backgroundColor: Colors.white,
      width: 310,
      child: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(22, 28, 22, 24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primaryDark, AppColors.primaryColor],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 27,
                        backgroundColor: Colors.white,
                        child: Text(
                          _initials(displayName),
                          style: const TextStyle(
                            color: AppColors.primaryColor,
                            fontWeight: FontWeight.w800,
                            fontSize: 17,
                          ),
                        ),
                      ),
                      const SizedBox(width: 13),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'ReliefLink',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 19,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Donation Management System',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Text(
                    displayName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
                  ),
                  if (email.trim().isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      email,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(10, 12, 10, 8),
                children: [
                  _section('MAIN'),
                  _item(
                    context,
                    Icons.dashboard_rounded,
                    'Dashboard',
                    () => _go(
                      context,
                      HomeScreen(userName: userName, email: email),
                    ),
                  ),
                  _item(
                    context,
                    Icons.campaign_rounded,
                    'Announcements',
                    () => _go(
                      context,
                      AnnouncementsScreen(userName: userName, email: email),
                    ),
                  ),
                  _item(
                    context,
                    Icons.volunteer_activism_rounded,
                    'Make a Donation',
                    () => _go(context, const DonationScreen()),
                  ),
                  _item(
                    context,
                    Icons.receipt_long_rounded,
                    'Donation Summary',
                    () => _go(context, const DonationHistoryScreen()),
                  ),
                  _item(
                    context,
                    Icons.bar_chart_rounded,
                    'Reports',
                    () => _go(context, const TransparencyScreen()),
                  ),
                  _section('ACCOUNT'),
                  _item(
                    context,
                    Icons.person_rounded,
                    'My Profile',
                    () => _go(
                      context,
                      ProfileScreen(userName: userName, email: email),
                    ),
                  ),
                  _item(
                    context,
                    Icons.church_rounded,
                    'About Sto. Domingo Church',
                    () => _go(
                      context,
                      AboutScreen(userName: userName, email: email),
                    ),
                  ),
                  _section('SESSION'),
                  _item(
                    context,
                    Icons.logout_rounded,
                    'Log Out',
                    () => _logout(context),
                    color: AppColors.errorColor,
                  ),
                ],
              ),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Text(
                'ReliefLink • Transparent and accountable giving',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 10,
                  color: AppColors.subtitleColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _initials(String value) {
    final words = value
        .trim()
        .split(RegExp(r'\s+'))
        .where((e) => e.isNotEmpty)
        .toList();

    if (words.isEmpty) return 'RL';

    return words.take(2).map((e) => e[0]).join().toUpperCase();
  }

  Widget _section(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 13, 14, 7),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
          color: AppColors.subtitleColor,
        ),
      ),
    );
  }

  Widget _item(
    BuildContext context,
    IconData icon,
    String title,
    VoidCallback onTap, {
    Color color = AppColors.titleColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: ListTile(
        dense: true,
        minVerticalPadding: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        leading: Icon(icon, color: color, size: 21),
        title: Text(
          title,
          style: TextStyle(
            color: color,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        trailing: const Icon(
          Icons.chevron_right_rounded,
          size: 18,
          color: AppColors.subtitleColor,
        ),
        onTap: onTap,
      ),
    );
  }
}
