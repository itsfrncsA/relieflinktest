
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

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

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
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

  static String normalizeDestination(String raw) {
    final lower = raw.trim().toLowerCase();
    if (lower.contains('general') || lower.isEmpty) return 'Parish General Fund';
    if (lower.contains('scholar') || lower.contains('student')) return 'Student Scholarships';
    if (lower.contains('elderly') || lower.contains('senior')) return 'Elderly';
    if (lower.contains('drug') || lower.contains('rehab')) return 'Drug Rehabilitation';
    if (lower.contains('urban') || lower.contains('poor')) return 'Urban Poor';
    if (lower.contains('pdl') || lower.contains('prison') || lower.contains('nakakolong')) return 'PDL';
    if (lower.contains('lgbtq')) return 'LGBTQ';
    if (lower.contains('migrant')) return 'Migrant';
    return raw.trim();
  }

  static Color getDestinationColor(String destination, int fallbackIndex) {
    final lower = destination.toLowerCase();
    if (lower.contains('general')) return const Color(0xFF2563EB); // Blue
    if (lower.contains('scholar') || lower.contains('student')) return const Color(0xFFEA580C); // Orange
    if (lower.contains('elderly') || lower.contains('senior')) return const Color(0xFFDB2777); // Pink
    if (lower.contains('drug') || lower.contains('rehab')) return const Color(0xFFD97706); // Amber
    if (lower.contains('urban') || lower.contains('poor')) return const Color(0xFF16A34A); // Green
    if (lower.contains('lgbtq')) return const Color(0xFF7C3AED); // Purple
    if (lower.contains('pdl') || lower.contains('prison')) return const Color(0xFFDC2626); // Red
    if (lower.contains('migrant')) return const Color(0xFF0891B2); // Cyan
    return chartColors[fallbackIndex % chartColors.length];
  }

  bool _isCheckingPending = false;
  bool _isAutoVerifyingPending = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _currentTab = widget.initialTab.clamp(0, 4);
    _visitedTabs.add(_currentTab);
    _loadSummary();
    _checkPendingDonation();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkPendingDonation();
    }
  }

  Future<void> _checkPendingDonation() async {
    if (_isCheckingPending) return;
    _isCheckingPending = true;

    try {
      final prefs = await SharedPreferences.getInstance();
      final pendingDonationId = prefs.getString('pending_donation_id');

      if (pendingDonationId != null && pendingDonationId.isNotEmpty) {
        final res = await ApiService().autoVerifyPayMongoDonation(pendingDonationId);
        final status = res['status']?.toString().toLowerCase().trim();
        final donation = res['donation'] is Map ? res['donation'] as Map : null;
        final donationStatus = donation?['status']?.toString().toLowerCase().trim();
        final isSuccess = res['success'] == true;

        if (status == 'success' ||
            status == 'paid' ||
            status == 'approved' ||
            status == 'completed' ||
            status == 'verified' ||
            donationStatus == 'approved' ||
            donationStatus == 'paid' ||
            (isSuccess &&
                (status != 'failed' &&
                    status != 'cancelled' &&
                    status != 'canceled' &&
                    status != 'pending' &&
                    status != null))) {
          
          final pendingAmount = prefs.getDouble('pending_donation_amount') ??
              (donation != null
                  ? (donation['amount'] is num
                      ? (donation['amount'] as num).toDouble()
                      : double.tryParse(donation['amount']?.toString() ?? '') ?? 0.0)
                  : 0.0);

          final pendingDest = prefs.getString('pending_donation_dest') ??
              (donation != null
                  ? (donation['destination']?.toString() ?? 'Parish General Fund')
                  : 'Parish General Fund');

          await prefs.remove('pending_donation_id');
          await prefs.remove('pending_donation_amount');
          await prefs.remove('pending_donation_dest');

          if (mounted) {
            _showSuccessModal(
              amount: pendingAmount,
              destination: pendingDest,
            );
            _loadSummary();
          }
        } else if (status == 'failed' ||
            status == 'cancelled' ||
            status == 'canceled' ||
            donationStatus == 'failed' ||
            donationStatus == 'cancelled') {
          await prefs.remove('pending_donation_id');
          await prefs.remove('pending_donation_amount');
          await prefs.remove('pending_donation_dest');
        }
      }
    } catch (_) {
      // Ignore background check errors
    } finally {
      _isCheckingPending = false;
    }
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
    if (mounted) {
      setState(() => loading = true);
    }

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

        final status =
            (item['status'] ?? '').toString().toLowerCase();

        final verification =
            (item['verificationStatus'] ?? '').toString().toLowerCase();

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

        final rawVerified = item['verifiedAmount'];
        final verifiedNum = rawVerified is num
            ? rawVerified.toDouble().abs()
            : double.tryParse(rawVerified?.toString() ?? '')?.abs();
        final rawAmount = item['amount'];
        final fallbackAmount = rawAmount is num
            ? rawAmount.toDouble().abs()
            : double.tryParse(rawAmount?.toString() ?? '')?.abs() ?? 0;
        final amount = (item['isTampered'] == true && verifiedNum != null)
            ? verifiedNum
            : (verifiedNum ?? fallbackAmount);

        if (amount <= 0) continue;

        total += amount;
        count++;

        final rawDestination =
            (item['destination'] ?? 'Parish General Fund')
                .toString()
                .trim();

        final destination = normalizeDestination(rawDestination);
        totals[destination] = (totals[destination] ?? 0) + amount;
      }

      // Check if there is any pending PayMongo donation in the last 30 minutes to auto-verify
      if (!_isAutoVerifyingPending) {
        _isAutoVerifyingPending = true;
        Future.microtask(() async {
          bool anyUpdated = false;
          try {
            for (final item in list) {
              if (item is! Map) continue;
              final itemStatus = (item['status'] ?? '').toString().toLowerCase();
              final itemMethod = (item['paymentMethod'] ?? '').toString().toLowerCase();
              final session = item['checkoutSessionId']?.toString();
              final id = item['_id']?.toString();
              if (itemStatus == 'pending' &&
                  (itemMethod.contains('paymongo') || (session != null && session.isNotEmpty)) &&
                  id != null) {
                final createdAtStr = item['createdAt']?.toString();
                if (createdAtStr != null) {
                  final dt = DateTime.tryParse(createdAtStr);
                  if (dt != null && DateTime.now().difference(dt).inMinutes < 30) {
                    final checkRes = await ApiService().autoVerifyPayMongoDonation(id);
                    if (checkRes['status'] == 'paid' || checkRes['success'] == true) {
                      anyUpdated = true;
                    }
                  }
                }
              }
            }
            if (anyUpdated && mounted) {
              _loadSummary();
            }
          } catch (_) {
          } finally {
            _isAutoVerifyingPending = false;
          }
        });
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

  Future<void> _showSuccessModal({
    required double amount,
    required String destination,
  }) async {
    if (!mounted) return;

    final formattedAmt = amount.toStringAsFixed(2).replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
          (match) => '${match.group(1)},',
        );

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(
            horizontal: 24,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(26),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.12),
                  blurRadius: 30,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(26),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(
                      24,
                      28,
                      24,
                      26,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColors.primaryColor,
                          AppColors.primaryColor.withOpacity(0.82),
                        ],
                      ),
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 82,
                          height: 82,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.check_rounded,
                            size: 48,
                            color: AppColors.primaryColor,
                          ),
                        ),
                        const SizedBox(height: 18),
                        const Text(
                          'Donation Successful!',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Thank you for making a difference.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.primaryColor.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            children: [
                              Text(
                                'DONATION AMOUNT',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1,
                                  color: AppColors.subtitleColor,
                                ),
                              ),
                              const SizedBox(height: 5),
                              Text(
                                '₱$formattedAmt',
                                style: TextStyle(
                                  fontSize: 30,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primaryColor,
                                ),
                              ),
                              const SizedBox(height: 9),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.green.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.verified_rounded,
                                      size: 14,
                                      color: Colors.green,
                                    ),
                                    SizedBox(width: 5),
                                    Text(
                                      'Payment Verified',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.green,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: Colors.grey.shade200,
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: AppColors.primaryColor.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(
                                  Icons.volunteer_activism_rounded,
                                  size: 20,
                                  color: AppColors.primaryColor,
                                ),
                              ),
                              const SizedBox(width: 11),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Donation Purpose',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.subtitleColor,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      destination,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(13),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.06),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.check_circle_outline_rounded,
                                size: 19,
                                color: Colors.green,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Your donation has been verified and recorded.',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.green,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      'An official confirmation receipt has been sent to your email.',
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        height: 1.35,
                                        color: AppColors.subtitleColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.pop(dialogContext);
                              _selectTab(3);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryColor,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: const Text(
                              'View My Contributions',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
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
        titleSpacing: 16,
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
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'ReliefLink',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    'PARISH RELIEF & DONATION SYSTEM',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 8.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white70,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
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
          style: TextStyle(
            fontSize: 12,
            color: AppColors.subtitleColor,
          ),
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

    final entries = destinationTotals.entries
        .where((entry) => entry.value > 0)
        .toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    final chartTotal = entries.fold<double>(
      0,
      (sum, entry) => sum + entry.value,
    );

    // Synchronize slice colors with legend colors 1-to-1
    final sliceColors = entries.asMap().entries.map((item) {
      return getDestinationColor(item.value.key, item.key);
    }).toList();

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
                          colors: sliceColors,
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
              ...entries.asMap().entries.map((mapEntry) {
                final index = mapEntry.key;
                final entry = mapEntry.value;
                final color = sliceColors[index % sliceColors.length];
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
          'Reports and Transparency',
          'View available donation records and reports.',
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
                  'Summary',
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
              'Donation',
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
            Icon(
              selected ? activeIcon : inactiveIcon,
              color: color,
              size: 22,
            ),
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
