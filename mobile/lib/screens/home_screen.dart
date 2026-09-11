import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
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
  final int initialTab;

  const HomeScreen({
    super.key,
    required this.userName,
    required this.email,
    this.initialTab = 0,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late int _currentTab;

  bool loading = true;
  double totalDonations = 0;
  int donationCount = 0;
  DateTime? _lastBackPressTime;

  @override
  void initState() {
    super.initState();
    _currentTab = widget.initialTab;
    _loadSummary();
  }

  Future<void> _loadSummary() async {
    if (mounted) setState(() => loading = true);

    try {
      final result = await ApiService().getDonationHistory();

      if (!mounted) return;

      if (result['success'] == true) {
        final list = result['data'] is List
            ? result['data'] as List
            : <dynamic>[];

        double total = 0;
        int count = 0;
        final currentUserName = widget.userName.trim().toLowerCase();
        final currentUserEmail = widget.email.trim().toLowerCase();

        for (final item in list) {
          if (item is! Map) continue;
          final donation = item;
          final donor = (donation['donorName'] ?? '').toString().trim().toLowerCase();
          final email = (donation['donorEmail'] ?? donation['email'] ?? '').toString().trim().toLowerCase();

          final isExactEmailMatch = currentUserEmail.isNotEmpty && email.isNotEmpty && email == currentUserEmail;
          final isExactNameMatch = currentUserName.isNotEmpty && donor.isNotEmpty && donor == currentUserName;

          if (isExactEmailMatch || isExactNameMatch) {
            final status = (donation['verificationStatus'] ?? donation['status'] ?? '').toString().toLowerCase();
            if (status.contains('approved') || status.contains('verified') || status.contains('complete')) {
              final raw = donation['amount'];
              total += raw is num
                  ? raw.toDouble().abs()
                  : double.tryParse(raw?.toString() ?? '')?.abs() ?? 0;
              count++;
            }
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

  void _openDonation() {
    setState(() => _currentTab = 2);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;

        // If on another tab, go back to Dashboard / Home tab first
        if (_currentTab != 0) {
          setState(() => _currentTab = 0);
          return;
        }

        // If on Home tab, require double press within 2 seconds to exit gracefully
        final now = DateTime.now();
        if (_lastBackPressTime == null ||
            now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
          _lastBackPressTime = now;
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Press back again to exit'),
              duration: Duration(seconds: 2),
              behavior: SnackBarBehavior.floating,
            ),
          );
          return;
        }

        await SystemNavigator.pop();
      },
      child: Scaffold(
        backgroundColor: AppColors.backgroundColor,
        body: IndexedStack(
          index: _currentTab,
          children: [
            _buildDashboardTab(),
            AnnouncementsScreen(
              userName: widget.userName,
              email: widget.email,
              isTab: true,
            ),
            const DonationScreen(isTab: true),
            DonationHistoryScreen(
              userName: widget.userName,
              email: widget.email,
              isTab: true,
            ),
            ProfileScreen(
              userName: widget.userName,
              email: widget.email,
              isTab: true,
            ),
          ],
        ),
        bottomNavigationBar: _buildTikTokBottomBar(),
      ),
    );
  }

  Widget _buildDashboardTab() {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'assets/images/relieflink_logo.png',
              width: 30,
              height: 30,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Icon(
                Icons.volunteer_activism_rounded,
                color: Colors.white,
                size: 24,
              ),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'ReliefLink',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.3,
                  ),
                ),
                Text(
                  'Sto. Domingo Church',
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w500,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Transparency Reports',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const TransparencyScreen(),
              ),
            ),
            icon: const Icon(Icons.bar_chart_rounded),
          ),
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
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 30),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 920),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
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
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: MediaQuery.of(context).size.width > 650 ? 3 : 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.2,
                    children: [
                      _quick(
                        'Donate',
                        'Make a new donation',
                        Icons.volunteer_activism_rounded,
                        _openDonation,
                      ),
                      _quick(
                        'Summary',
                        'View your donations',
                        Icons.receipt_long_rounded,
                        () => setState(() => _currentTab = 3),
                      ),
                      _quick(
                        'Reports',
                        'View public records',
                        Icons.bar_chart_rounded,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const TransparencyScreen(),
                          ),
                        ),
                      ),
                      _quick(
                        'Announcements',
                        'Parish updates & news',
                        Icons.campaign_rounded,
                        () => setState(() => _currentTab = 1),
                      ),
                      _quick(
                        'Profile',
                        'Manage your account',
                        Icons.person_rounded,
                        () => setState(() => _currentTab = 4),
                      ),
                      _quick(
                        'About Church',
                        'Learn about parish',
                        Icons.church_rounded,
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => AboutScreen(
                              userName: widget.userName,
                              email: widget.email,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Material(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    elevation: 0,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const TransparencyScreen(),
                        ),
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: Colors.black12),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: AppColors.primaryLight,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Icon(
                                Icons.verified_rounded,
                                color: AppColors.primaryColor,
                                size: 26,
                              ),
                            ),
                            const SizedBox(width: 14),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Transparency First',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.titleColor,
                                    ),
                                  ),
                                  SizedBox(height: 3),
                                  Text(
                                    'Review public donations, expenses, financial audits, and blockchain verified ledgers.',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.subtitleColor,
                                      height: 1.3,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(
                              Icons.arrow_forward_ios_rounded,
                              size: 16,
                              color: AppColors.subtitleColor,
                            ),
                          ],
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'RELIEFLINK DONOR DASHBOARD',
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
                  loading ? '—' : '₱${totalDonations.toStringAsFixed(2)}',
                  Icons.volunteer_activism_rounded,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _stat(
                  'TRANSACTIONS',
                  loading ? '—' : '$donationCount',
                  Icons.receipt_long_rounded,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stat(String label, String value, IconData icon) {
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
              crossAxisAlignment: CrossAxisAlignment.start,
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
      elevation: 0,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.black.withValues(alpha: 0.06)),
          ),
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(11),
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

  Widget _buildTikTokBottomBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(
          top: BorderSide(
            color: Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 66,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // 1. Home
              _buildNavItem(
                index: 0,
                label: 'Home',
                activeIcon: Icons.home_rounded,
                inactiveIcon: Icons.home_outlined,
              ),

              // 2. Announcements
              _buildNavItem(
                index: 1,
                label: 'Updates',
                activeIcon: Icons.campaign_rounded,
                inactiveIcon: Icons.campaign_outlined,
              ),

              // 3. Center Prominent "Donate" Action Button
              _buildCenterDonateButton(),

              // 4. History
              _buildNavItem(
                index: 3,
                label: 'History',
                activeIcon: Icons.receipt_long_rounded,
                inactiveIcon: Icons.receipt_long_outlined,
              ),

              // 5. Profile
              _buildNavItem(
                index: 4,
                label: 'Profile',
                activeIcon: Icons.person_rounded,
                inactiveIcon: Icons.person_outline_rounded,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required String label,
    required IconData activeIcon,
    required IconData inactiveIcon,
  }) {
    final isSelected = _currentTab == index;
    final color = isSelected ? AppColors.primaryColor : const Color(0xFF64748B);

    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _currentTab = index),
        splashColor: AppColors.primaryLight,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : inactiveIcon,
              color: color,
              size: 24,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                color: color,
                letterSpacing: 0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterDonateButton() {
    final isSelected = _currentTab == 2;
    return Expanded(
      child: InkWell(
        onTap: _openDonation,
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: isSelected ? 52 : 48,
              height: isSelected ? 36 : 34,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    AppColors.primaryDark,
                    AppColors.primaryColor,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
                border: isSelected
                    ? Border.all(color: AppColors.secondaryColor, width: 2)
                    : null,
                boxShadow: [
                  BoxShadow(
                    color: isSelected
                        ? AppColors.primaryColor.withValues(alpha: 0.5)
                        : AppColors.primaryColor.withValues(alpha: 0.35),
                    blurRadius: isSelected ? 10 : 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.volunteer_activism_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 3),
            Text(
              'Donate',
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                color: isSelected ? AppColors.primaryColor : const Color(0xFF64748B),
                letterSpacing: 0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
