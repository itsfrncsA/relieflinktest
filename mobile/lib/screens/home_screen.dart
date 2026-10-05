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
  final Set<int> _visitedTabs = {};

  bool loading = true;
  double totalDonations = 0;
  int donationCount = 0;
  DateTime? _lastBackPressTime;

  @override
  void initState() {
    super.initState();

    _currentTab = widget.initialTab;
    _visitedTabs.add(_currentTab);

    _loadSummary();
  }

  void _selectTab(int index) {
    if (!_visitedTabs.contains(index)) {
      setState(() {
        _visitedTabs.add(index);
        _currentTab = index;
      });
    } else if (_currentTab != index) {
      setState(() => _currentTab = index);
    }
  }

  Future<void> _loadSummary() async {
    if (mounted) {
      setState(() => loading = true);
    }

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

          final donor = (donation['donorName'] ?? '')
              .toString()
              .trim()
              .toLowerCase();

          final email = (donation['donorEmail'] ??
                  donation['email'] ??
                  '')
              .toString()
              .trim()
              .toLowerCase();

          final isExactEmailMatch =
              currentUserEmail.isNotEmpty &&
              email.isNotEmpty &&
              email == currentUserEmail;

          final isExactNameMatch =
              currentUserName.isNotEmpty &&
              donor.isNotEmpty &&
              donor == currentUserName;

          if (isExactEmailMatch || isExactNameMatch) {
            final status = (donation['verificationStatus'] ??
                    donation['status'] ??
                    '')
                .toString()
                .toLowerCase();

            if (status.contains('approved') ||
                status.contains('verified') ||
                status.contains('complete')) {
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
    _selectTab(2);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;

        // If on another tab, return to Home first.
        if (_currentTab != 0) {
          _selectTab(0);
          return;
        }

        // Require double back press to exit.
        final now = DateTime.now();

        if (_lastBackPressTime == null ||
            now.difference(_lastBackPressTime!) >
                const Duration(seconds: 2)) {
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
            _visitedTabs.contains(0)
                ? _buildDashboardTab()
                : const SizedBox.shrink(),

            _visitedTabs.contains(1)
                ? AnnouncementsScreen(
                    userName: widget.userName,
                    email: widget.email,
                    isTab: true,
                    onBackToHome: () => _selectTab(0),
                  )
                : const SizedBox.shrink(),

            _visitedTabs.contains(2)
                ? DonationScreen(
                    isTab: true,
                    onBackToHome: () => _selectTab(0),
                  )
                : const SizedBox.shrink(),

            _visitedTabs.contains(3)
                ? DonationHistoryScreen(
                    userName: widget.userName,
                    email: widget.email,
                    isTab: true,
                    onBackToHome: () => _selectTab(0),
                  )
                : const SizedBox.shrink(),

            _visitedTabs.contains(4)
                ? ProfileScreen(
                    userName: widget.userName,
                    email: widget.email,
                    isTab: true,
                    onBackToHome: () => _selectTab(0),
                  )
                : const SizedBox.shrink(),
          ],
        ),
        bottomNavigationBar: _buildBottomNavigationBar(),
      ),
    );
  }

  // ============================================================
  // HOME / DASHBOARD
  // ============================================================

  Widget _buildDashboardTab() {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        titleSpacing: 16,
        elevation: 0,
        title: FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.asset(
                'assets/images/relieflink_logo.png',
                width: 29,
                height: 29,
                cacheWidth: 87,
                cacheHeight: 87,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const Icon(
                  Icons.volunteer_activism_rounded,
                  color: Colors.white,
                  size: 23,
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
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadSummary,
        color: AppColors.primaryColor,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(18, 20, 18, 30),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 920),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildGreeting(),

                  const SizedBox(height: 18),

                  _buildDonationHero(),

                  const SizedBox(height: 24),

                  _buildGivingSection(),

                  const SizedBox(height: 24),

                  _buildTransparencyCard(),

                  const SizedBox(height: 28),

                  _buildExploreSection(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ============================================================
  // GREETING
  // ============================================================

  Widget _buildGreeting() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          greeting(),
          style: const TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w900,
            color: AppColors.titleColor,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 5),
        const Text(
          'Every contribution can make a difference.',
          style: TextStyle(
            fontSize: 14,
            color: AppColors.subtitleColor,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  // ============================================================
  // MAIN DONATION HERO
  // ============================================================

  Widget _buildDonationHero() {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(26),
      child: InkWell(
        onTap: _openDonation,
        borderRadius: BorderRadius.circular(26),
        child: Ink(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [
                AppColors.primaryDark,
                AppColors.primaryColor,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(26),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryColor.withValues(alpha: 0.20),
                blurRadius: 22,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(
                      Icons.volunteer_activism_rounded,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'GIVE WITH PURPOSE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 22),

              const Text(
                'Support Sto. Domingo Church',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.3,
                ),
              ),

              const SizedBox(height: 7),

              const Text(
                'Your generosity helps support church programs, activities, and community initiatives.',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 13,
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 20),

              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(13),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Make a Donation',
                      style: TextStyle(
                        color: AppColors.primaryColor,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    SizedBox(width: 8),
                    Icon(
                      Icons.arrow_forward_rounded,
                      color: AppColors.primaryColor,
                      size: 17,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================
  // YOUR GIVING
  // ============================================================

  Widget _buildGivingSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your Giving',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: AppColors.titleColor,
          ),
        ),

        const SizedBox(height: 4),

        const Text(
          'A quick overview of your verified donations.',
          style: TextStyle(
            fontSize: 12.5,
            color: AppColors.subtitleColor,
          ),
        ),

        const SizedBox(height: 13),

        Row(
          children: [
            Expanded(
              child: _givingStat(
                icon: Icons.volunteer_activism_rounded,
                label: 'TOTAL DONATED',
                value: loading
                    ? '—'
                    : '₱${totalDonations.toStringAsFixed(2)}',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _givingStat(
                icon: Icons.receipt_long_rounded,
                label: 'TRANSACTIONS',
                value: loading ? '—' : '$donationCount',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _givingStat({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: const Color(0xFFE5EAF1),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: AppColors.primaryColor,
              size: 21,
            ),
          ),

          const SizedBox(width: 11),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 8.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.subtitleColor,
                    letterSpacing: 0.5,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppColors.titleColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // TRANSPARENCY
  // ============================================================

  Widget _buildTransparencyCard() {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(21),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => const TransparencyScreen(),
            ),
          );
        },
        borderRadius: BorderRadius.circular(21),
        child: Ink(
          width: double.infinity,
          padding: const EdgeInsets.all(19),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(21),
            border: Border.all(
              color: AppColors.primaryColor.withValues(alpha: 0.18),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.035),
                blurRadius: 14,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const Icon(
                  Icons.bar_chart_rounded,
                  color: AppColors.primaryColor,
                  size: 25,
                ),
              ),

              const SizedBox(width: 14),

              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Donation Transparency',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppColors.titleColor,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'View available donation records and information.',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: AppColors.subtitleColor,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(11),
                ),
                child: const Icon(
                  Icons.arrow_forward_rounded,
                  color: AppColors.primaryColor,
                  size: 18,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================
  // EXPLORE RELIEFLINK
  // ============================================================

  Widget _buildExploreSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Explore ReliefLink',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: AppColors.titleColor,
          ),
        ),

        const SizedBox(height: 5),

        const Text(
          'Stay informed and learn more about the platform.',
          style: TextStyle(
            fontSize: 12.5,
            color: AppColors.subtitleColor,
            height: 1.35,
          ),
        ),

        const SizedBox(height: 14),

        _exploreItem(
          icon: Icons.campaign_rounded,
          title: 'Announcements',
          subtitle: 'Parish updates, news, and important notices',
          onTap: () => _selectTab(1),
        ),

        const SizedBox(height: 10),

        _exploreItem(
          icon: Icons.receipt_long_rounded,
          title: 'Donation Summary',
          subtitle: 'Review your previous donation records',
          onTap: () => _selectTab(3),
        ),

        const SizedBox(height: 10),

        _exploreItem(
          icon: Icons.church_rounded,
          title: 'About ReliefLink',
          subtitle: 'Learn more about ReliefLink and its purpose',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => AboutScreen(
                  userName: widget.userName,
                  email: widget.email,
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _exploreItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(17),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(17),
        child: Ink(
          padding: const EdgeInsets.symmetric(
            horizontal: 15,
            vertical: 14,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(17),
            border: Border.all(
              color: const Color(0xFFE7EBF1),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: AppColors.primaryColor,
                  size: 21,
                ),
              ),

              const SizedBox(width: 13),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.titleColor,
                      ),
                    ),

                    const SizedBox(height: 3),

                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.subtitleColor,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              const Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: Color(0xFF94A3B8),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================
  // BOTTOM NAVIGATION
  // HOME | DONATE | PROFILE
  // ============================================================

  Widget _buildBottomNavigationBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(
          top: BorderSide(
            color: Color(0xFFE5EAF1),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.045),
            blurRadius: 18,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 66,
          child: Row(
            children: [
              Expanded(
                child: _buildSimpleNavItem(
                  index: 0,
                  label: 'Home',
                  activeIcon: Icons.home_rounded,
                  inactiveIcon: Icons.home_outlined,
                ),
              ),

              Expanded(
                child: _buildDonateNavItem(),
              ),

              Expanded(
                child: _buildSimpleNavItem(
                  index: 4,
                  label: 'Profile',
                  activeIcon: Icons.person_rounded,
                  inactiveIcon: Icons.person_outline_rounded,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSimpleNavItem({
    required int index,
    required String label,
    required IconData activeIcon,
    required IconData inactiveIcon,
  }) {
    final isSelected = _currentTab == index;

    final color = isSelected
        ? AppColors.primaryColor
        : const Color(0xFF64748B);

    return InkWell(
      onTap: () => _selectTab(index),
      splashColor: AppColors.primaryLight,
      highlightColor: Colors.transparent,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? activeIcon : inactiveIcon,
              color: color,
              size: 23,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight:
                    isSelected ? FontWeight.w800 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Donate is emphasized, but it stays at the same level
  // as Home and Profile. It is not a floating button.
  Widget _buildDonateNavItem() {
    final isSelected = _currentTab == 2;

    return InkWell(
      onTap: _openDonation,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Center(
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 7,
          ),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primaryColor.withValues(alpha: 0.12)
                : AppColors.primaryLight,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isSelected
                    ? Icons.volunteer_activism_rounded
                    : Icons.volunteer_activism_outlined,
                color: AppColors.primaryColor,
                size: 21,
              ),
              const SizedBox(width: 7),
              Text(
                'Donate',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight:
                      isSelected ? FontWeight.w900 : FontWeight.w800,
                  color: AppColors.primaryColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}