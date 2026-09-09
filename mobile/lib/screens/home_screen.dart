import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../widgets/app_drawer.dart';
import '../widgets/custom_card.dart';
import '../services/api_service.dart';
import 'donation_screen.dart';
import 'donation_history_screen.dart';
import 'announcements_screen.dart';
import 'transparency_screen.dart';
import 'profile_screen.dart';
import 'about_screen.dart';

class HomeScreen extends StatefulWidget {
  final String userName;
  final String email;

  const HomeScreen({
    super.key,
    required this.userName,
    required this.email,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool loading = true;
  double totalDonations = 0;
  int donationCount = 0;

  @override
  void initState() {
    super.initState();
    _loadSummary();
  }

  Future<void> _loadSummary() async {
    if (mounted) setState(() => loading = true);

    try {
      final result =
          await ApiService().getDonationHistory();

      if (!mounted) return;

      if (result['success'] == true) {
        final list = result['data'] is List
            ? result['data'] as List
            : <dynamic>[];

        double total = 0;
        int count = 0;

        for (final donation in list) {
          final status = (donation['verificationStatus'] ?? donation['status'] ?? '').toString().toLowerCase();
          if (status.contains('approved') || status.contains('verified') || status.contains('complete')) {
            final raw = donation['amount'];
            total += raw is num
                ? raw.toDouble().abs()
                : double.tryParse(
                      raw?.toString() ?? '',
                    )?.abs() ??
                    0;
            count++;
          }
        }

        setState(() {
          totalDonations = total;
          donationCount = count;
          loading = false;
        });
      } else {
        setState(() => loading = false);
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
    }
  }

  String greeting() {
    final hour = DateTime.now().hour;
    final name = widget.userName.trim().isEmpty
        ? 'there'
        : widget.userName.trim().split(' ').first;

    if (hour < 12) return 'Good morning, $name';
    if (hour < 18) return 'Good afternoon, $name';
    return 'Good evening, $name';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      drawer: AppDrawer(
        userName: widget.userName,
        email: widget.email,
      ),
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: loading ? null : _loadSummary,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadSummary,
        color: AppColors.primaryColor,
        child: SingleChildScrollView(
          physics:
              const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(
            18,
            18,
            18,
            30,
          ),
          child: Center(
            child: ConstrainedBox(
              constraints:
                  const BoxConstraints(maxWidth: 920),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  _welcomeCard(),
                  const SizedBox(height: 22),
                  const Text(
                    'Quick actions',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: AppColors.titleColor,
                    ),
                  ),
                  const SizedBox(height: 11),
                  GridView.count(
                    shrinkWrap: true,
                    physics:
                        const NeverScrollableScrollPhysics(),
                    crossAxisCount:
                        MediaQuery.of(context).size.width >
                                650
                            ? 3
                            : 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.2,
                    children: [
                      _quick(
                        'Donate',
                        'Make a new donation',
                        Icons.volunteer_activism_rounded,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                const DonationScreen(),
                          ),
                        ),
                      ),
                      _quick(
                        'Summary',
                        'View your donations',
                        Icons.receipt_long_rounded,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                const DonationHistoryScreen(),
                          ),
                        ),
                      ),
                      _quick(
                        'Reports',
                        'View public records',
                        Icons.bar_chart_rounded,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                const TransparencyScreen(),
                          ),
                        ),
                      ),
                      _quick(
                        'Profile',
                        'Manage your account',
                        Icons.person_rounded,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                ProfileScreen(
                              userName: widget.userName,
                              email: widget.email,
                            ),
                          ),
                        ),
                      ),
                      _quick(
                        'Announcements',
                        'Parish updates & news',
                        Icons.campaign_rounded,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                AnnouncementsScreen(
                              userName: widget.userName,
                              email: widget.email,
                            ),
                          ),
                        ),
                      ),
                      _quick(
                        'About Us',
                        'Learn about the church',
                        Icons.church_rounded,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                AboutScreen(
                              userName: widget.userName,
                              email: widget.email,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  CustomCard(
                    title: 'Transparency first',
                    subtitle:
                        'Review public donations, expenses, financial totals, and blockchain information in the reports module.',
                    icon: Icons.verified_rounded,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            const TransparencyScreen(),
                      ),
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

  Widget _welcomeCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            AppColors.primaryDark,
            AppColors.primaryColor,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          const Text(
            'RELIEFLINK',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            greeting(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 7),
          const Text(
            'Manage your donations with clarity, accountability, and confidence.',
            style: TextStyle(
              color: Colors.white70,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: _stat(
                  'YOUR DONATIONS',
                  loading
                      ? '—'
                      : '₱${totalDonations.toStringAsFixed(2)}',
                  Icons.volunteer_activism_rounded,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _stat(
                  'TRANSACTIONS',
                  loading
                      ? '—'
                      : '$donationCount',
                  Icons.receipt_long_rounded,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stat(
    String label,
    String value,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: .12),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: Colors.white,
            size: 21,
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 8,
                    color: Colors.white70,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _quick(
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap,
  ) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            mainAxisAlignment:
                MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius:
                      BorderRadius.circular(11),
                ),
                child: Icon(
                  icon,
                  size: 22,
                  color: AppColors.primaryColor,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                  color: AppColors.titleColor,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 10.5,
                  color: AppColors.subtitleColor,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
