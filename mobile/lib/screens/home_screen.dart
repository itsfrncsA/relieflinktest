import 'dart:math' as math;
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

  final Map<String, double> destinationTotals = {};

  static const List<String> donationDestinations = [
    'Parish General Fund',
    'LGBTQ',
    'Elderly',
    'PDL',
    'Urban Poor',
    'Migrant',
    'Student Scholarships',
    'Drug Rehabilitation',
  ];

  static const List<Color> chartColors = [
    Color(0xFF2563EB),
    Color(0xFF7C3AED),
    Color(0xFFDB2777),
    Color(0xFFEA580C),
    Color(0xFF16A34A),
    Color(0xFF0891B2),
    Color(0xFFD97706),
    Color(0xFF64748B),
  ];

  @override
  void initState() {
    super.initState();
    _currentTab = widget.initialTab.clamp(0, 4);
    _visitedTabs.add(_currentTab);
    _loadSummary();
  }

  void _selectTab(int index) {
    if (index < 0 || index > 4) return;

    setState(() {
      _visitedTabs.add(index);
      _currentTab = index;
    });

    if (index == 3) {
      _loadSummary();
    }
  }

  Future<void> _loadSummary() async {
    if (mounted) setState(() => loading = true);

    try {
      final result = await ApiService().getDonationHistory();

      if (!mounted) return;

      if (result['success'] != true) {
        setState(() => loading = false);
        return;
      }

      final List<dynamic> list =
          result['data'] is List ? result['data'] as List : [];

      double total = 0;
      int count = 0;
      final Map<String, double> totals = {};

      for (final item in list) {
        if (item is! Map) continue;

        final status = (item['status'] ?? '').toString().toLowerCase();
        final verification = (item['verificationStatus'] ?? '')
            .toString()
            .toLowerCase();

        final approved = status == 'approved' ||
            status == 'completed' ||
            status == 'cash on hand' ||
            status == 'partially used' ||
            status == 'fully used' ||
            verification == 'approved' ||
            verification == 'cash on hand' ||
            verification == 'partially used' ||
            verification == 'fully used';

        if (!approved) continue;

        final rawAmount = item['amount'];
        final amount = rawAmount is num
            ? rawAmount.toDouble().abs()
            : double.tryParse(rawAmount?.toString() ?? '')?.abs() ?? 0;

        if (amount <= 0) continue;

        total += amount;
        count++;

        final rawDestination =
            (item['destination'] ?? 'Parish General Fund').toString().trim();

        final destination = donationDestinations.firstWhere(
          (name) => name.toLowerCase() == rawDestination.toLowerCase(),
          orElse: () => rawDestination.isEmpty
              ? 'Parish General Fund'
              : rawDestination,
        );

        totals[destination] = (totals[destination] ?? 0) + amount;
      }

      setState(() {
        totalDonations = total;
        donationCount = count;
        destinationTotals
          ..clear()
          ..addAll(totals);
        loading = false;
      });
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

    if (hour < 12) return 'Good Morning, $name!';
    if (hour < 17) return 'Good Afternoon, $name!';
    return 'Good Evening, $name!';
  }

  void _openDonation() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const DonationScreen(),
      ),
    ).then((_) => _loadSummary());
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;

        if (_currentTab != 0) {
          _selectTab(0);
          return;
        }

        final now = DateTime.now();
        if (_lastBackPressTime == null ||
            now.difference(_lastBackPressTime!) >
                const Duration(seconds: 2)) {
          _lastBackPressTime = now;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Press back again to exit'),
              duration: Duration(seconds: 2),
            ),
          );
          return;
        }

        SystemNavigator.pop();
      },
      child: Scaffold(
        body: IndexedStack(
          index: _currentTab,
          children: [
            _buildDashboardTab(),
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

  Widget _buildDashboardTab() {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            Image.asset(
              'assets/images/relieflink_logo.png',
              width: 30,
              height: 30,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Icon(
                Icons.volunteer_activism_rounded,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ReliefLink',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  'PARISH RELIEF & DONATION SYSTEM',
                  style: TextStyle(
                    fontSize: 8.5,
                    fontWeight: FontWeight.w700,
                    color: Colors.white70,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadSummary,
        color: AppColors.primaryColor,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(18, 20, 18, 30),
          children: [
            Text(
              greeting(),
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w900,
                color: AppColors.titleColor,
              ),
            ),
            const SizedBox(height: 5),
            const Text(
              'Every contribution can make a difference.',
              style: TextStyle(color: AppColors.subtitleColor),
            ),
            const SizedBox(height: 20),
            _donationHero(),
            const SizedBox(height: 24),
            _givingSection(),
            const SizedBox(height: 24),
            _destinationChart(),
            const SizedBox(height: 28),
            _exploreSection(),
          ],
        ),
      ),
    );
  }

  Widget _donationHero() {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        onTap: _openDonation,
        borderRadius: BorderRadius.circular(24),
        child: Ink(
          padding: const EdgeInsets.all(23),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primaryDark, AppColors.primaryColor],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.volunteer_activism_rounded,
                color: Colors.white,
                size: 34,
              ),
              SizedBox(height: 18),
              Text(
                'Support Sto. Domingo Church',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Your generosity helps support church programs, activities, and community initiatives.',
                style: TextStyle(color: Colors.white70, height: 1.5),
              ),
              SizedBox(height: 18),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Make a Donation',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward_rounded, color: Colors.white),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _givingSection() {
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
          style: TextStyle(fontSize: 12, color: AppColors.subtitleColor),
        ),
        const SizedBox(height: 13),
        Row(
          children: [
            Expanded(
              child: _stat(
                Icons.volunteer_activism_rounded,
                'TOTAL DONATED',
                loading ? '—' : '₱${totalDonations.toStringAsFixed(2)}',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _stat(
                Icons.receipt_long_rounded,
                'TRANSACTIONS',
                loading ? '—' : '$donationCount',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _stat(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(color: const Color(0xFFE5EAF1)),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primaryColor, size: 24),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: AppColors.subtitleColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 15,
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

  Widget _destinationChart() {
    final hasDonations = destinationTotals.values.any((amount) => amount > 0);

    final entries = donationDestinations
        .map(
          (destination) => MapEntry(
            destination,
            destinationTotals[destination] ?? 0.0,
          ),
        )
        .where((entry) => entry.value > 0)
        .toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    final chartTotal = entries.fold<double>(
      0,
      (sum, entry) => sum + entry.value,
    );

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5EAF1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Where Your Donations Go',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w900,
              color: AppColors.titleColor,
            ),
          ),
          const SizedBox(height: 5),
          const Text(
            'Your approved donations grouped by selected destination.',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.subtitleColor,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 18),
          if (loading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(25),
                child: CircularProgressIndicator(),
              ),
            )
          else ...[
            Center(
              child: SizedBox(
                width: 190,
                height: 190,
                child: CustomPaint(
                  painter: hasDonations
                      ? _DonationPiePainter(
                          entries: entries,
                          colors: chartColors,
                          total: chartTotal,
                        )
                      : _EmptyDonationPiePainter(),
                ),
              ),
            ),
            const SizedBox(height: 18),
            if (!hasDonations)
              const Padding(
                padding: EdgeInsets.only(bottom: 14),
                child: Center(
                  child: Text(
                    'No approved donations yet',
                    style: TextStyle(
                      color: AppColors.subtitleColor,
                      fontSize: 12,
                    ),
                  ),
                ),
              )
            else ...[
              const Divider(height: 26),
              ...entries.map((entry) {
                final originalIndex =
                    donationDestinations.indexOf(entry.key);
                final color = chartColors[
                    originalIndex >= 0
                        ? originalIndex % chartColors.length
                        : 0];
                final percent = chartTotal > 0
                    ? ((entry.value / chartTotal) * 100).toStringAsFixed(1)
                    : '0.0';

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          entry.key,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.titleColor,
                          ),
                        ),
                      ),
                      Text(
                        '₱${entry.value.toStringAsFixed(2)} ($percent%)',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: color,
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ],
      ),
    );
  }

  Widget _exploreSection() {
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
        const SizedBox(height: 12),
        _exploreItem(
          Icons.bar_chart_rounded,
          'Donation Transparency',
          'View available donation records and information.',
          () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const TransparencyScreen(),
              ),
            );
          },
        ),
        _exploreItem(
          Icons.receipt_long_rounded,
          'Donation Summary',
          'Review your previous donation records',
          () => _selectTab(3),
        ),
        _exploreItem(
          Icons.church_rounded,
          'About ReliefLink',
          'Learn more about ReliefLink and its purpose',
          () {
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

  Widget _exploreItem(
    IconData icon,
    String title,
    String subtitle,
    VoidCallback onTap,
  ) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primaryColor),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14),
        onTap: onTap,
      ),
    );
  }

  Widget _buildBottomNavigationBar() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: Color(0xFFE5EAF1)),
        ),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 65,
          child: Row(
            children: [
              Expanded(
                child: _navItem(
                  0,
                  'Home',
                  Icons.home_rounded,
                  Icons.home_outlined,
                ),
              ),
              Expanded(
                child: _navItem(
                  1,
                  'Announcements',
                  Icons.campaign_rounded,
                  Icons.campaign_outlined,
                ),
              ),
              Expanded(
                child: _buildDonateNavItem(),
              ),
              Expanded(
                child: _navItem(
                  3,
                  'History',
                  Icons.receipt_long_rounded,
                  Icons.receipt_long_outlined,
                ),
              ),
              Expanded(
                child: _navItem(
                  4,
                  'Profile',
                  Icons.person_rounded,
                  Icons.person_outline_rounded,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDonateNavItem() {
    return InkWell(
      onTap: () => _selectTab(2),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    AppColors.primaryDark,
                    AppColors.primaryColor,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryColor.withValues(alpha: 0.35),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Icon(
                Icons.volunteer_activism_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(height: 3),
            const Text(
              'Donate',
              style: TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.w700,
                color: AppColors.primaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _navItem(
    int index,
    String label,
    IconData activeIcon,
    IconData inactiveIcon,
  ) {
    final selected = _currentTab == index;
    final color = selected
        ? AppColors.primaryColor
        : const Color(0xFF64748B);

    return InkWell(
      onTap: () => _selectTab(index),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(selected ? activeIcon : inactiveIcon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10,
                fontWeight: selected ? FontWeight.w800 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DonationPiePainter extends CustomPainter {
  final List<MapEntry<String, double>> entries;
  final List<Color> colors;
  final double total;

  _DonationPiePainter({
    required this.entries,
    required this.colors,
    required this.total,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (total <= 0 || entries.isEmpty) return;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);

    double startAngle = -math.pi / 2;

    for (int i = 0; i < entries.length; i++) {
      final sweepAngle = (entries[i].value / total) * 2 * math.pi;
      final paint = Paint()
        ..color = colors[i % colors.length]
        ..style = PaintingStyle.fill;

      canvas.drawArc(rect, startAngle, sweepAngle, true, paint);
      startAngle += sweepAngle;
    }

    final holeRadius = radius * 0.55;
    final holePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, holeRadius, holePaint);
  }

  @override
  bool shouldRepaint(covariant _DonationPiePainter oldDelegate) => true;
}

class _EmptyDonationPiePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;

    final basePaint = Paint()
      ..color = const Color(0xFFF1F5F9)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, basePaint);

    final holeRadius = radius * 0.55;
    final holePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, holeRadius, holePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
